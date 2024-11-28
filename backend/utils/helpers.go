package utils

import (
	"fmt"
	"log"
	"strconv"
	"strings"
)

// func FetchIdFromPath(urlPath, trim string) (int, error) {
// 	userIdStr := strings.TrimPrefix(urlPath, trim)
// 	userID, err := strconv.Atoi(userIdStr)
// 	if err != nil {
// 		return 0, err
// 	}
// 	return userID, nil
// }

func FetchIdFromPath(path string, position int) (int, error) {
	// Trim leading/trailing slashes and split the path
	parts := strings.Split(strings.Trim(path, "/"), "/")

	// Ensure the position exists
	if position < 0 || position >= len(parts) {
		return 0, fmt.Errorf("invalid position: %d", position)
	}

	response,_ := strconv.Atoi(parts[position])
	
	log.Println("FetchIdFromPath response: ", response)

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
