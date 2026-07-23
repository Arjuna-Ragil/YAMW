package helper

import (
	"crypto/md5"
	"encoding/hex"
	"math/rand/v2"
)

func GenerateSalt(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.IntN(len(letters))]
	}

	return string(s)
}

func CreateToken(password, salt string) string{
	hash := md5.New()
	hash.Write([]byte(password + salt))
	return hex.EncodeToString(hash.Sum(nil))
}