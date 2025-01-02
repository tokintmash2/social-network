package utils

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func HandleFileUpload(r *http.Request, fieldName string, uploadDir string) (string, error) {

	file, fileHeader, err := r.FormFile(fieldName)
	if err != nil {
		log.Println("HandleFileUpload: FormFile error", err)
		return "", err
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
