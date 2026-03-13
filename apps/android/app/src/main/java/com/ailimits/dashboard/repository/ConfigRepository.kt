package com.ailimits.dashboard.repository

import android.content.Context
import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.ProviderType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

object ConfigRepository {
    private const val PREFS_NAME = "ai_limits_settings"
    private const val KEY_CONFIGS = "provider_configs"

    suspend fun getConfigs(context: Context): List<ProviderConfig> = withContext(Dispatchers.IO) {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonStr = prefs.getString(KEY_CONFIGS, null) ?: return@withContext emptyList()
            val arr = JSONArray(jsonStr)
            (0 until arr.length()).mapNotNull { i ->
                val obj = arr.optJSONObject(i) ?: return@mapNotNull null
                parseConfig(obj)
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    suspend fun saveConfigs(context: Context, configs: List<ProviderConfig>) =
        withContext(Dispatchers.IO) {
            val arr = JSONArray()
            configs.forEach { c ->
                arr.put(JSONObject().apply {
                    put("id", c.id)
                    put("type", c.type.name)
                    put("apiKey", c.apiKey)
                    put("customEndpoint", c.customEndpoint)
                    put("displayName", c.displayName)
                    put("manualLimit", c.manualLimit)
                    put("manualUsed", c.manualUsed)
                })
            }
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_CONFIGS, arr.toString())
                .apply()
        }

    private fun parseConfig(obj: JSONObject): ProviderConfig? {
        val id = obj.optString("id") ?: return null
        val typeStr = obj.optString("type") ?: return null
        val type = try {
            ProviderType.valueOf(typeStr)
        } catch (_: Exception) {
            return null
        }
        return ProviderConfig(
            id = id,
            type = type,
            apiKey = obj.optString("apiKey").takeIf { it.isNotEmpty() },
            customEndpoint = obj.optString("customEndpoint").takeIf { it.isNotEmpty() },
            displayName = obj.optString("displayName").takeIf { it.isNotEmpty() },
            manualLimit = obj.optDouble("manualLimit").takeIf { !obj.isNull("manualLimit") },
            manualUsed = obj.optDouble("manualUsed").takeIf { !obj.isNull("manualUsed") },
        )
    }
}
