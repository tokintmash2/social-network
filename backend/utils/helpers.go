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
