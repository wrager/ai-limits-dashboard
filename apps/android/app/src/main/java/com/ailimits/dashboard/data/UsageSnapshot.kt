package com.ailimits.dashboard.data

data class UsageSnapshot(
    val providerId: String,
    val used: Double,
    val limit: Double,
    val unit: String,
    val timestamp: Long,
    val status: UsageStatus,
    val displayName: String? = null,
)

enum class UsageStatus { OK, WARNING, ERROR }
