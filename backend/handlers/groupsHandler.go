package handlers

import (
	"log"
	"net/http"
)

func GroupsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupsHandler called")

	switch r.Method {
	case "GET":
		FetchAllGroups(w, r)
	case "POST":
		CreateGroupHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// func GroupsHandler(writer http.ResponseWriter, request *http.Request) {

// 	log.Println("GroupsHandler called")

// 	// var userID int

// 	cookie, err := request.Cookie("session")
// 	if err != nil {
// 		http.Redirect(writer, request, "/login", http.StatusSeeOther)
// 		return
// 	}

// 	sessionUUID := cookie.Value
// 	userID, validSession := utils.VerifySession(sessionUUID, "GroupsHandler")
// 	if !validSession {
// 		http.Redirect(writer, request, "/login", http.StatusSeeOther)
// 		return
// 	}

// 	if request.Method == http.MethodPost {
// 		var group structs.Group

// 		err := json.NewDecoder(request.Body).Decode(&group)
// 		if err != nil {
// 			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
// 			return
// 		}
// 		if group.Name == "" || group.Description == "" {
// 			http.Error(writer, "Group name or description cannot be empty", http.StatusBadRequest)
// 			return
// 		}

// 		log.Println("Group:", group) // testing

// 		group.CreatorID = userID
// 		group.CreatedAt = time.Now()

// 		err = utils.CreateGroup(group)
// 		if err != nil {
// 			log.Printf("Error creating group: %v\n", err)
// 			http.Error(writer, "Error creating group", http.StatusInternalServerError)
// 			return
// 		}

// 		response := map[string]interface{}{
// 			"success": true,
// 		}

// 		writer.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(writer).Encode(response)
// 		return
// 	}
// }
