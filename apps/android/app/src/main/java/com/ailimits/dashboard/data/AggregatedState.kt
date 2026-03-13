package com.ailimits.dashboard.data

data class AggregatedState(
    val snapshots: List<UsageSnapshot>,
    val lastUpdated: Long,
    val hasErrors: Boolean,
)
