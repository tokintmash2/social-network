package utils

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func HandleFileUpload(r *http.Request, fieldName string, uploadDir string) (string, error) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		return "", err
	}

	file, fileHeader, err := r.FormFile(fieldName)
	if err != nil || file == nil {
		return "", nil // No file uploaded, return empty filename
	}
	defer file.Close()

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), fileHeader.Filename)

	// Create uploads directory
	os.MkdirAll(uploadDir, 0755)

	// Create new file
	dst, err := os.Create(filepath.Join(uploadDir, filename))
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy uploaded file
	_, err = io.Copy(dst, file)
	if err != nil {
		return "", err
	}

	return filename, nil
}
