package utils

import (
	"crypto/sha1"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"math/rand"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"
)

var (
	ErrExists        = errors.New("exists")
	fnvHash          = fnv.New32a()
	sha1Hash         = sha1.New()
	skuCounter int64 = 0
	mux        sync.Mutex
	seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))
)

const (
	charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
)

type Elem struct {
	Text  string      `json:"text"`
	Value interface{} `json:"value"`
}

type KeySecret struct {
	Key    string `json:"access_token"`
	Secret string `json:"refresh_token"`
}

func RandomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func Hash(attrs ...interface{}) string {
	for _, attr := range attrs {
		if attr == nil {
			continue
		}
		fnvHash.Write([]byte(attr.(string)))
	}
	defer fnvHash.Reset()

	return fmt.Sprintf("%x", fnvHash.Sum(nil))
}

func Sha1(attrs ...interface{}) string {
	for _, attr := range attrs {
		if attr == nil {
			continue
		}
		sha1Hash.Write([]byte(attr.(string)))
	}
	defer sha1Hash.Reset()

	return fmt.Sprintf("%x", sha1Hash.Sum(nil))
}

func LowerFirst(s string) string {
	if s == "" {
		return ""
	}
	r, n := utf8.DecodeRuneInString(s)
	return string(unicode.ToLower(r)) + s[n:]
}

func getSKU() string {
	mux.Lock()
	defer mux.Unlock()
	skuCounter++
	if skuCounter > 999 {
		skuCounter = 0
	}
	return strconv.Itoa(int(time.Now().Unix()*1000 + skuCounter))
}

func ToIJSON(v interface{}) string {
	b, _ := json.MarshalIndent(v, "", " ")
	return string(b)
}

func ToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

func idx(s []string, e string) int {
	for i, a := range s {
		if a == e {
			return i
		}
	}
	return -1
}

func ContainsAny(s []string, es ...string) bool {
	for _, e := range es {
		if idx(s, e) >= 0 {
			return true
		}
	}
	return false
}

func ContainsAll(s []string, es ...string) bool {
	for _, e := range es {
		if idx(s, e) < 0 {
			return false
		}
	}
	return true
}

func JsonEscape(i string) (string, error) {
	b, err := json.Marshal(i)
	if err != nil {
		return "", err
	}
	s := string(b)
	return s[1 : len(s)-1], nil
}

func LongestCommonPrefix(strs ...string) string {
	if 0 == len(strs) {
		return ""
	}
	// Find word with minimum length
	short := strs[0]
	for _, s := range strs {
		if len(short) >= len(s) {
			short = s
		}
	}
	// Loop over minword length: from one character prefix to full minword
	prefx_array := []string{}
	prefix := ""
	old_prefix := ""
	for i := 0; i < len(short); i++ {
		// https://hermanschaaf.com/efficient-string-concatenation-in-go/
		prefx_array = append(prefx_array, string(short[i]))
		prefix = strings.Join(prefx_array, "")
		// Sub loop check all elements start with the prefix
		for _, s := range strs {
			// https://gist.github.com/lbvf50mobile/65298c689e2f2b850aa6ad8bd7b61717
			if !strings.HasPrefix(s, prefix) {
				return old_prefix
			}
		}
		old_prefix = prefix
	}
	return prefix
}
