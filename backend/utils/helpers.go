package utils

import (
	"strconv"
	"strings"
)

func FetchIdFromPath(urlPath, trim string) (int, error) {
	userIdStr := strings.TrimPrefix(urlPath, trim)
	userID, err := strconv.Atoi(userIdStr)
	if err != nil {
		return 0, err
	}
	return userID, nil
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
