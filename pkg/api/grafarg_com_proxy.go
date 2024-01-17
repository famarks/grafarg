package api

import (
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/famarks/grafarg/pkg/models"
	"github.com/famarks/grafarg/pkg/setting"
	"github.com/famarks/grafarg/pkg/util"
)

var grafargComProxyTransport = &http.Transport{
	Proxy: http.ProxyFromEnvironment,
	Dial: (&net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}).Dial,
	TLSHandshakeTimeout: 10 * time.Second,
}

func ReverseProxyGnetReq(proxyPath string) *httputil.ReverseProxy {
	url, _ := url.Parse(setting.GrafargComUrl)

	director := func(req *http.Request) {
		req.URL.Scheme = url.Scheme
		req.URL.Host = url.Host
		req.Host = url.Host

		req.URL.Path = util.JoinURLFragments(url.Path+"/api", proxyPath)

		// clear cookie headers
		req.Header.Del("Cookie")
		req.Header.Del("Set-Cookie")
		req.Header.Del("Authorization")
	}

	return &httputil.ReverseProxy{Director: director}
}

func ProxyGnetRequest(c *models.ReqContext) {
	proxyPath := c.Params("*")
	proxy := ReverseProxyGnetReq(proxyPath)
	proxy.Transport = grafargComProxyTransport
	proxy.ServeHTTP(c.Resp, c.Req.Request)
	c.Resp.Header().Del("Set-Cookie")
}
