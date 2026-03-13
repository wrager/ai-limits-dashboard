package com.ailimits.dashboard.repository

import com.ailimits.dashboard.data.AggregatedState
import com.ailimits.dashboard.data.ProviderConfig
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.provider.getProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun aggregateUsage(configs: List<ProviderConfig>): AggregatedState =
    withContext(Dispatchers.Default) {
        val snapshots = mutableListOf<UsageSnapshot>()
        for (config in configs) {
            val provider = getProvider(config.type)
            if (!provider.validateConfig(config)) continue
            val snapshot = provider.fetchUsage(config)
            snapshots.add(snapshot)
        }
        AggregatedState(
            snapshots = snapshots,
            lastUpdated = System.currentTimeMillis(),
            hasErrors = snapshots.any { it.status == com.ailimits.dashboard.data.UsageStatus.ERROR },
        )
    }
