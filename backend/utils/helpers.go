package utils

import (
	"fmt"
	"social-network/database"
	"strconv"
	"strings"
)

// Returns the last inserted ID from the database
func GetLastInsertedID() (int, error) {
	var ID int
	err := database.DB.QueryRow("SELECT last_insert_rowid()").Scan(&ID)
	if err != nil {
		return 0, err
	}
	return ID, nil
}

func FetchIdFromPath(path string, position int) (int, error) {
	// Trim leading/trailing slashes and split the path
	parts := strings.Split(strings.Trim(path, "/"), "/")

	// Ensure the position exists
	if position < 0 || position >= len(parts) {
		return 0, fmt.Errorf("invalid position: %d", position)
	}

	response, _ := strconv.Atoi(parts[position])

	return response, nil
}

// convertToIntSlice converts a string slice to an integer slice
func ConvertToIntSlice(strSlice []string) []int {
	intSlice := make([]int, len(strSlice))
	for i, str := range strSlice {
		num, err := strconv.Atoi(str)
		if err != nil {
			continue
		}
		intSlice[i] = num
	}
	return intSlice
}

func BreakArray(array []string) [][]string {
	chunkSize := 100
	var chunks [][]string
	for i := 0; i < len(array); i += chunkSize {
		end := i + chunkSize
		if end > len(array) {
			end = len(array)
		}
		chunks = append(chunks, array[i:end])
	}
	return chunks
}