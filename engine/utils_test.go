package engine

import "testing"

func TestHash(t *testing.T) {
	h := hash("mama")
	if h != "c19b2ed9" {
		t.Error("bad has code: ", h)
	}
}

func TestRandomLetters(t *testing.T) {
	h := randomString(6)
	if len(h) != 6 {
		t.Error("bad has code: ", h)
	}
}
