

# URL Shortener and Analytics Tracker

This project is a Node.js application designed for URL shortening and analytics tracking. It offers a streamlined service for converting lengthy URLs into shorter, more manageable ones while also providing comprehensive analytics on user interaction.

It utilizes EJS for server-side rendering and JWT tokens for authentication.

You can check out the deployed project at [url-shortner-zq7h.onrender.com](https://url-shortner-zq7h.onrender.com).

## API Reference

#### Generate Short url

```
  POST /url
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `url` | `string` | **Long URL to be shortened**|

#### Get Analytics

```
    GET /url/analytics/:shortId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `shordId`      | `string` | **shortId of the url**|

#### Redirect Short URL

```
    GET /url/:shortId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `shordId`      | `string` | **shortId of the url**|






## Authors
 [@yashthakare93](https://www.github.com/yashthakare93)

