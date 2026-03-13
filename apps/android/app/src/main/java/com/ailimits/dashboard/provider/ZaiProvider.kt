package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.ProviderType
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.data.UsageStatus

class ZaiProvider : UsageProvider {
    override fun validateConfig(config: ProviderConfig): Boolean {
        if (config.type != ProviderType.ZAI) return false
        if (config.customEndpoint != null) return true
        return config.manualUsed != null &&
            config.manualLimit != null &&
            config.manualLimit!! > 0
    }

    override suspend fun fetchUsage(config: ProviderConfig): UsageSnapshot {
        if (config.type != ProviderType.ZAI) return errorSnapshot(config.id)
        config.customEndpoint?.let { return fetchFromCustom(config) }
        config.manualUsed?.let { used ->
            config.manualLimit?.let { limit ->
                if (limit > 0) {
                    val ratio = used / limit
                    return UsageSnapshot(
                        providerId = config.id,
                        used = used,
                        limit = limit,
                        unit = if (config.displayName?.contains("%") == true) "%" else "manual",
                        timestamp = System.currentTimeMillis(),
                        status = usageStatus(ratio),
                        displayName = config.displayName ?: "z.ai",
                    )
                }
            }
        }
        return errorSnapshot(config.id)
    }

    private suspend fun fetchFromCustom(config: ProviderConfig): UsageSnapshot =
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                val url = java.net.URL(config.customEndpoint!!)
                (url.openConnection() as javax.net.ssl.HttpsURLConnection).apply {
                    requestMethod = "GET"
                    config.apiKey?.let { setRequestProperty("Authorization", "Bearer $it") }
                    connectTimeout = 10000
                    readTimeout = 10000
                }.run {
                    if (responseCode != 200) return@withContext errorSnapshot(config.id)
                    val body = inputStream.bufferedReader().use { it.readText() }
                    val json = org.json.JSONObject(body)
                    val used = json.optDouble("used", 0.0)
                    val limit = json.optDouble("limit", 1.0).takeIf { it > 0 } ?: 1.0
                    UsageSnapshot(
                        providerId = config.id,
                        used = used,
                        limit = limit,
                        unit = json.optString("unit", "manual"),
                        timestamp = System.currentTimeMillis(),
                        status = usageStatus(used / limit),
                        displayName = config.displayName ?: "z.ai",
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
        unit = "manual",
        timestamp = System.currentTimeMillis(),
        status = UsageStatus.ERROR,
        displayName = "z.ai",
    )
}
