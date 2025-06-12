package ses

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type pageData struct {
	Title   string
	Message string
	Fruits  []string
}

var pageTemplate = `
	<html>
	<head></head>
	<body>
		<h1>{{.Title}}</h1>
		<p>{{.Message}}</p>
		<h2>Fruits</h2>
		<ul>
			{{range .Fruits}}
				<li>{{.}}</li>
			{{end}}
		</ul>
	</body>
	</html>
`

func TestHtmlTemplate(t *testing.T) {
	data := pageData{
		Title:   "Test Page",
		Message: "testing a template",
		Fruits:  []string{"apple", "banana", "pear"},
	}

	res, err := HtmlTemplate(pageTemplate, data)
	assert.NoError(t, err)
	assert.Contains(t, res, "<h1>Test Page</h1>")
	assert.Contains(t, res, "<li>apple</li>")
}
