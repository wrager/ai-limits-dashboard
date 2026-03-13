package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.data.UsageStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

class AnthropicProvider : UsageProvider {
    override fun validateConfig(config: ProviderConfig): Boolean =
        config.type == "anthropic" && !config.apiKey.isNullOrBlank()

    override suspend fun fetchUsage(config: ProviderConfig): UsageSnapshot =
        withContext(Dispatchers.IO) {
            if (!validateConfig(config) || config.apiKey == null) return@withContext errorSnapshot(config.id)
            val now = java.util.Calendar.getInstance()
            val startOfMonth = java.util.Calendar.getInstance().apply {
                set(java.util.Calendar.DAY_OF_MONTH, 1)
                set(java.util.Calendar.HOUR_OF_DAY, 0)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)
            }.time
            val endOfMonth = now.time
            val urlStr =
                "https://api.anthropic.com/v1/organizations/cost_report?starting_at=${java.net.URLEncoder.encode(java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(startOfMonth), "UTF-8")}&ending_at=${java.net.URLEncoder.encode(java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(endOfMonth), "UTF-8")}&bucket_width=1d&limit=31"
            try {
                val url = URL(urlStr)
                (url.openConnection() as HttpsURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("x-api-key", config.apiKey!!)
                    setRequestProperty("anthropic-version", "2023-06-01")
                    setRequestProperty("Content-Type", "application/json")
                    connectTimeout = 10000
                    readTimeout = 10000
                }.run {
                    if (responseCode != 200) return@withContext errorSnapshot(config.id)
                    val body = inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(body)
                    val data = json.optJSONArray("data") ?: return@withContext errorSnapshot(config.id)
                    var used = 0.0
                    for (i in 0 until data.length()) {
                        val bucket = data.optJSONObject(i) ?: continue
                        val results = bucket.optJSONArray("results") ?: continue
                        for (j in 0 until results.length()) {
                            val r = results.optJSONObject(j)
                            used += r?.optDouble("amount", 0.0) ?: 0.0
                        }
                    }
                    val limit = config.manualLimit ?: 100.0
                    val ratio = if (limit > 0) used / limit else 0.0
                    UsageSnapshot(
                        providerId = config.id,
                        used = used,
                        limit = limit,
                        unit = "USD",
                        timestamp = System.currentTimeMillis(),
                        status = usageStatus(ratio),
                        displayName = config.displayName ?: "Anthropic",
                    )
                }
            } catch (_: Exception) {
                errorSnapshot(config.id)
            }
        }

    private fun errorSnapshot(providerId: String) = UsageSnapshot(
        providerId = providerId,
        used = 0.0,
        limit = 1.0,
        unit = "USD",
        timestamp = System.currentTimeMillis(),
        status = UsageStatus.ERROR,
        displayName = "Anthropic",
    )
}
