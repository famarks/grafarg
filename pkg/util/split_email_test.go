package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSplitEmails(t *testing.T) {
	testcases := []struct {
		input    string
		expected []string
	}{
		{
			input:    "",
			expected: []string{},
		},
		{
			input:    "ops@grafarg.org",
			expected: []string{"ops@grafarg.org"},
		},
		{
			input:    "ops@grafarg.org;dev@grafarg.org",
			expected: []string{"ops@grafarg.org", "dev@grafarg.org"},
		},
		{
			input:    "ops@grafarg.org;dev@grafarg.org,",
			expected: []string{"ops@grafarg.org", "dev@grafarg.org"},
		},
		{
			input:    "dev@grafarg.org,ops@grafarg.org",
			expected: []string{"dev@grafarg.org", "ops@grafarg.org"},
		},
		{
			input:    "dev@grafarg.org,ops@grafarg.org,",
			expected: []string{"dev@grafarg.org", "ops@grafarg.org"},
		},
		{
			input:    "dev@grafarg.org\nops@grafarg.org",
			expected: []string{"dev@grafarg.org", "ops@grafarg.org"},
		},
		{
			input:    "dev@grafarg.org\nops@grafarg.org\n",
			expected: []string{"dev@grafarg.org", "ops@grafarg.org"},
		},
	}

	for _, tt := range testcases {
		emails := SplitEmails(tt.input)
		assert.Equal(t, tt.expected, emails)
	}
}
