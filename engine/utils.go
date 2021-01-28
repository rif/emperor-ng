package engine

import (
	"crypto/sha1"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"math"
	"math/rand"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/rs/zerolog/log"
	"github.com/shopspring/decimal"
	"github.com/tidwall/gjson"
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
	ErrCodeMultipleOrders             = 1
	ErrCodeQuantityExceeded           = 2
	ErrCodeUpdateFailed               = 3
	ErrCodeItemNotFound               = 4
	charset                           = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	GoogleMerchantSaleOMapping        = "GoogleMerchant"
	merchantID                 uint64 = 214996785
	timeFormat                        = "2006-01-02T15:04:05-07:00"
)

type Elem struct {
	Text  string      `json:"text"`
	Value interface{} `json:"value"`
}

type KeySecret struct {
	Key    string `json:"access_token"`
	Secret string `json:"refresh_token"`
}

type Mapper struct {
	DescToMatrix map[string]*Elem `json:"descToMatrix"` // desc -> (matrix.desc,matrix.id)
	Abort        bool             `json:"abort"`        // exiting order found
}

type Inventory struct {
	OrderID  string   `json:"orderID"`
	ItemDesc string   `json:"itemDesc"`
	Quantity int      `json:"quantity"`
	Received int      `json:"received"`
	Images   []string `json:"images"`
}

type Options struct {
	Page         int      `json:"page"`
	Brands       []string `json:"brands"`
	Filter       string   `json:"filter"`
	ItemsPerPage int      `json:"itemsPerPage"`
	SortBy       []string `json:"sortBy"`
	SortDesc     []bool   `json:"sortDesc"`
	GroupBy      []string `json:"groupBy"`
	GroupDesc    []bool   `json:"groupDesc"`
	MultiSort    bool     `json:"multiSort"`
	MustSort     bool     `json:"mustSort"`
	Search       string   `json:"search"`
}

type Enabler struct {
	Description bool `json:"description"`
	CategoryObj bool `json:"categoryObj"`
	BrandObj    bool `json:"brandObj"`
	Msrp        bool `json:"msrp"`
	Notes       bool `json:"notes"`
	LongDesc    bool `json:"longDesc"`
}

func randomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func hash(attrs ...interface{}) string {
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

func lowerFirst(s string) string {
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

func discount(price, percent float64) float64 {
	return math.Floor(price - (price * percent / 100))
}

func ToIJSON(v interface{}) string {
	b, _ := json.MarshalIndent(v, "", " ")
	return string(b)
}

func ToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

func getParams(regEx *regexp.Regexp, data string) (paramsMap map[string]string) {
	match := regEx.FindStringSubmatch(data)

	paramsMap = make(map[string]string)
	for i, name := range regEx.SubexpNames() {
		if i > 0 && i <= len(match) {
			paramsMap[name] = match[i]
		}
	}
	return
}

func idx(s []string, e string) int {
	for i, a := range s {
		if a == e {
			return i
		}
	}
	return -1
}

func containsAny(s []string, es ...string) bool {
	for _, e := range es {
		if idx(s, e) >= 0 {
			return true
		}
	}
	return false
}

func containsAll(s []string, es ...string) bool {
	for _, e := range es {
		if idx(s, e) < 0 {
			return false
		}
	}
	return true
}

func jsonEscape(i string) (string, error) {
	b, err := json.Marshal(i)
	if err != nil {
		return "", err
	}
	s := string(b)
	return s[1 : len(s)-1], nil
}

func getTags(el *gjson.Result) (tags []string) {
	log.Info().Str("tags", el.Get("Tags").String()).Msg("getting tags")
	count := el.Get("Tags.@attributes.count").Int()
	switch {
	case count == 1:
		tags = append(tags, el.Get("Tags.tag").String())
	case count > 1:
		el.Get("Tags.tag").ForEach(func(key, value gjson.Result) bool {
			tags = append(tags, value.String())
			return true
		})
	}
	return
}

func boolPtr(v bool) *bool                      { return &v }
func intPtr(v int) *int                         { return &v }
func strPtr(v string) *string                   { return &v }
func timePtr(v time.Time) *time.Time            { return &v }
func decPtr(v decimal.Decimal) *decimal.Decimal { return &v }

func longestCommonPrefix(strs ...string) string {
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
