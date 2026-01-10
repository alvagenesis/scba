export interface AverageStats {
    points: number
    rebounds: number
    assists: number
    steals: number
    blocks: number
    gamesPlayed: number
}

export function calculateAverageStats(stats: Array<{
    points: number
    rebounds: number
    assists: number
    steals: number
    blocks: number
}>): AverageStats {
    if (!stats || stats.length === 0) {
        return {
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            gamesPlayed: 0,
        }
    }

    const totals = stats.reduce(
        (acc, stat) => ({
            points: acc.points + stat.points,
            rebounds: acc.rebounds + stat.rebounds,
            assists: acc.assists + stat.assists,
            steals: acc.steals + stat.steals,
            blocks: acc.blocks + stat.blocks,
        }),
        { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 }
    )

    const gamesPlayed = stats.length

    return {
        points: Math.round((totals.points / gamesPlayed) * 10) / 10,
        rebounds: Math.round((totals.rebounds / gamesPlayed) * 10) / 10,
        assists: Math.round((totals.assists / gamesPlayed) * 10) / 10,
        steals: Math.round((totals.steals / gamesPlayed) * 10) / 10,
        blocks: Math.round((totals.blocks / gamesPlayed) * 10) / 10,
        gamesPlayed,
    }
}
