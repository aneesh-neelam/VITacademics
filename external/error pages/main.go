package base

import (
	"fmt"
	"net/http"
)

func init() {
	http.HandleFunc("/unknown", UnknownHandler)
	http.HandleFunc("/outage", OutageHandler)
}

var OutageError = "{\"Error\":{\"Message\":\"Our backend servers may be down or you may be facing a connectivity issue\",\"Code\":8}}"
var UnknownError = "{\"Error\":{\"Message\":\"An unforeseen error has occurred\",\"Code\":9}}"

func UnknownHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, UnknownError)
}

func OutageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, OutageError)
}
