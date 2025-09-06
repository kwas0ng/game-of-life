export interface Pattern {
    name: string;
    description: string;
    cells: [number, number][];
    width: number;
    height: number;
}

export const PATTERNS: Pattern[] = [
    {
        name: "Block",
        description: "Still life - remains unchanged",
        cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
        width: 2,
        height: 2
    },
    {
        name: "Blinker",
        description: "Oscillator with period 2",
        cells: [[1, 0], [1, 1], [1, 2]],
        width: 3,
        height: 1
    },
    {
        name: "Glider",
        description: "Moves diagonally across the grid",
        cells: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        width: 3,
        height: 3
    },
    {
        name: "Toad",
        description: "Oscillator with period 2",
        cells: [[1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2]],
        width: 4,
        height: 3
    },
    {
        name: "Beacon",
        description: "Oscillator with period 2",
        cells: [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]],
        width: 4,
        height: 4
    },
    {
        name: "Lightweight Spaceship",
        description: "Travels horizontally",
        cells: [[0, 1], [0, 4], [1, 0], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3]],
        width: 5,
        height: 4
    },
    {
        name: "Pulsar",
        description: "Oscillator with period 3",
        cells: [
            [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
            [0, 2], [5, 2], [7, 2], [12, 2],
            [0, 3], [5, 3], [7, 3], [12, 3],
            [0, 4], [5, 4], [7, 4], [12, 4],
            [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
            [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
            [0, 8], [5, 8], [7, 8], [12, 8],
            [0, 9], [5, 9], [7, 9], [12, 9],
            [0, 10], [5, 10], [7, 10], [12, 10],
            [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12]
        ],
        width: 13,
        height: 13
    },
    {
        name: "Gosper Glider Gun",
        description: "Produces gliders indefinitely",
        cells: [
            [0, 4], [0, 5], [1, 4], [1, 5],
            [10, 4], [10, 5], [10, 6], [11, 3], [11, 7], [12, 2], [12, 8],
            [13, 2], [13, 8], [14, 5], [15, 3], [15, 7], [16, 4], [16, 5], [16, 6], [17, 5],
            [20, 2], [20, 3], [20, 4], [21, 2], [21, 3], [21, 4], [22, 1], [22, 5],
            [24, 0], [24, 1], [24, 5], [24, 6],
            [34, 2], [34, 3], [35, 2], [35, 3]
        ],
        width: 36,
        height: 9
    },
];