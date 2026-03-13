package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.data.UsageStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

class OpenAIProvider : UsageProvider {
    override fun validateConfig(config: ProviderConfig): Boolean =
        config.type == "openai" && !config.apiKey.isNullOrBlank()

    override suspend fun fetchUsage(config: ProviderConfig): UsageSnapshot =
        withContext(Dispatchers.IO) {
            if (!validateConfig(config) || config.apiKey == null) return@withContext errorSnapshot(config.id)
            val now = System.currentTimeMillis() / 1000
            val startOfMonth = java.util.Calendar.getInstance().apply {
                set(java.util.Calendar.DAY_OF_MONTH, 1)
                set(java.util.Calendar.HOUR_OF_DAY, 0)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)
            }.timeInMillis / 1000
            val urlStr =
                "https://api.openai.com/v1/organization/usage/completions?start_time=$startOfMonth&end_time=$now&bucket_width=1d"
            try {
                val url = URL(urlStr)
                (url.openConnection() as HttpsURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("Authorization", "Bearer ${config.apiKey}")
                    connectTimeout = 10000
                    readTimeout = 10000
                }.run {
                    if (responseCode != 200) return@withContext errorSnapshot(config.id)
                    val body = inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(body)
                    val data = json.optJSONArray("data") ?: return@withContext errorSnapshot(config.id)
                    var used = 0L
                    for (i in 0 until data.length()) {
                        val bucket = data.optJSONObject(i) ?: continue
                        val result = bucket.opt("result") ?: continue
                        when (result) {
                            is org.json.JSONArray -> {
                                for (j in 0 until result.length()) {
                                    val r = result.optJSONObject(j)
                                    used += (r?.optInt("input_tokens", 0) ?: 0).toLong() +
                                        (r?.optInt("output_tokens", 0) ?: 0).toLong()
                                }
                            }
                            is JSONObject -> {
                                used += (result.optInt("input_tokens", 0)).toLong() +
                                    (result.optInt("output_tokens", 0)).toLong()
                            }
                        }
                    }
                    val limit = config.manualLimit?.toLong() ?: 1_000_000L
                    val ratio = if (limit > 0) used.toDouble() / limit else 0.0
                    UsageSnapshot(
                        providerId = config.id,
                        used = used.toDouble(),
                        limit = limit.toDouble(),
                        unit = "tokens",
                        timestamp = System.currentTimeMillis(),
                        status = usageStatus(ratio),
                        displayName = config.displayName ?: "OpenAI",
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
        unit = "tokens",
        timestamp = System.currentTimeMillis(),
        status = UsageStatus.ERROR,
        displayName = "OpenAI",
    )
}
