

# URL Shortener and Analytics Tracker

This project is a Node.js application designed for URL shortening and analytics tracking. It offers a streamlined service for converting lengthy URLs into shorter, more manageable ones while also providing comprehensive analytics on user interaction.
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
    GET /:shortId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `shordId`      | `string` | **shortId of the url**|






## Authors
 [@yashthakare93](https://www.github.com/yashthakare93)

