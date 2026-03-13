package com.ailimits.dashboard.provider

import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.data.UsageStatus

interface UsageProvider {
    fun validateConfig(config: ProviderConfig): Boolean
    suspend fun fetchUsage(config: ProviderConfig): UsageSnapshot
}

fun usageStatus(ratio: Double): UsageStatus = when {
    ratio >= 1.0 -> UsageStatus.ERROR
    ratio >= 0.8 -> UsageStatus.WARNING
    else -> UsageStatus.OK
}
