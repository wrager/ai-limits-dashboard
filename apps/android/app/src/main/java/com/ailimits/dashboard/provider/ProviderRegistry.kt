package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderType

val providers: Map<ProviderType, UsageProvider> = mapOf(
    ProviderType.OPENAI to OpenAIProvider(),
    ProviderType.ANTHROPIC to AnthropicProvider(),
    ProviderType.GEMINI to GeminiProvider(),
    ProviderType.ZAI to ZaiProvider(),
)

fun getProvider(type: ProviderType): UsageProvider = providers[type]!!
