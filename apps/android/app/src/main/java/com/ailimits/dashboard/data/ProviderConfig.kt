package com.ailimits.dashboard.data

data class ProviderConfig(
    val id: String,
    val type: ProviderType,
    val apiKey: String? = null,
    val customEndpoint: String? = null,
    val displayName: String? = null,
    val manualLimit: Double? = null,
    val manualUsed: Double? = null,
)

enum class ProviderType { OPENAI, ANTHROPIC, GEMINI, ZAI }
