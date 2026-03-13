package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.ProviderType
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.data.UsageStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

class GeminiProvider : UsageProvider {
    override fun validateConfig(config: ProviderConfig): Boolean =
        config.type == ProviderType.GEMINI && (
            config.customEndpoint != null ||
            (config.manualUsed != null && config.manualLimit != null && config.manualLimit!! > 0)
        )

    override suspend fun fetchUsage(config: ProviderConfig): UsageSnapshot =
        withContext(Dispatchers.IO) {
            if (config.type != ProviderType.GEMINI) return@withContext errorSnapshot(config.id)
            config.customEndpoint?.let { return@withContext fetchFromCustom(config) }
            if (config.manualUsed != null && config.manualLimit != null && config.manualLimit!! > 0) {
                val used = config.manualUsed
                val limit = config.manualLimit
                val ratio = used / limit
                return@withContext UsageSnapshot(
                    providerId = config.id,
                    used = used,
                    limit = limit,
                    unit = "tokens",
                    timestamp = System.currentTimeMillis(),
                    status = usageStatus(ratio),
                    displayName = config.displayName ?: "Gemini",
                )
            }
            errorSnapshot(config.id)
        }

    private suspend fun fetchFromCustom(config: ProviderConfig): UsageSnapshot = withContext(Dispatchers.IO) {
        val urlStr = config.customEndpoint ?: return@withContext errorSnapshot(config.id)
        try {
            val url = URL(urlStr)
            (url.openConnection() as HttpsURLConnection).apply {
                requestMethod = "GET"
                config.apiKey?.let { setRequestProperty("Authorization", "Bearer $it") }
                connectTimeout = 10000
                readTimeout = 10000
            }.run {
                if (responseCode != 200) return@withContext errorSnapshot(config.id)
                val body = inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(body)
                val used = json.optDouble("used", 0.0)
                val limit = json.optDouble("limit", 1.0).takeIf { it > 0 } ?: 1.0
                val ratio = used / limit
                UsageSnapshot(
                    providerId = config.id,
                    used = used,
                    limit = limit,
                    unit = json.optString("unit", "tokens"),
                    timestamp = System.currentTimeMillis(),
                    status = usageStatus(ratio),
                    displayName = config.displayName ?: "Gemini",
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
        displayName = "Gemini",
    )
}
