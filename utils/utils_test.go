package utils

import "testing"

func TestHash(t *testing.T) {
	h := Hash("mama")
	if h != "c19b2ed9" {
		t.Error("bad has code: ", h)
	}
}

func TestRandomLetters(t *testing.T) {
	h := RandomString(6)
	if len(h) != 6 {
		t.Error("bad has code: ", h)
	}
}
