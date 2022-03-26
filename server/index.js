const express = require('express')
const fs = require('fs')
const path = require('path')
const https = require('https')
const {parse} = require('node-html-parser')
const pdf = require('pdf-parse')
const app = express()
const port = 5000

const CASEDIR = './cases'

app.get('/api', (req, res) => {
  res.send('Working API')
})

app.get('/api/parse', (req, res) => {
	const axios = require('axios');
	const FormData = require('form-data');
	const data = new FormData();
	data.append('EcliIdentifikators', '');
	data.append('CaseNum', '');
	data.append('ArchiveNum', '');
	data.append('DateFrom', '');
	data.append('DateFromDisplay', '');
	data.append('DateTo', '');
	data.append('DateToDisplay', '');
	data.append('CourtId', ' 0');
	data.append('ProcTypeId', ' 2');
	data.append('ProcSubjTypeId', ' 0');
	data.append('DecisionHistFinalStat', ' 0');
	data.append('RoundId', ' 0');
	data.append('LawId', ' 0');
	data.append('LawPantCaption', ' ');
	data.append('SearchTypeId', ' 0');
	data.append('AnonymisedText', ' ');
	data.append('SearchStrNot', '');
	data.append('default-submit', '');
	data.append('PageNumber', ' 0');
	data.append('OrderBy', ' datums');
	data.append('OrderDirection', ' DESC');
	data.append('OldPageSize', ' 10');
	data.append('PageNumberFixed', ' 0');
	data.append('PageSize', ' 10');
	data.append('paging', 'next');
	data.append('PageNumberFixed', req.query.pageNum || 0);
	data.append('__RequestVerificationToken', '9ffXy7cQ_K8RUHC6V5LX02NBDmzAv9y4g7BjqNSESpAHcHLecumogrl6lAPppIjIxcvKnHzmsKcF9p7FUSMEOh4VVIqLZ6vrArCyWFK8fruxtfq8uP8QPYlzqLJpxx5wD8ArdQ2');

	var config = {
		method: 'post',
		url: 'https://manas.tiesas.lv/eTiesasMvc/lv/nolemumi',
		headers: { 
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36', 
			'Cookie': '__ASPCulture__=lv; ASP.NET_SessionId=ogh4qbd0h4hxfwf4bmnqi1vg; font_size=2; _ga=GA1.2.647864342.1647619974; _gid=GA1.2.1997336745.1648222702; pmcwidth=1920; simple_cookie_compliance_dismissed=1; __RequestVerificationToken_L2VUaWVzYXNNdmM1=NOyPVjmFxMhvV5VlzGDk3XQOsaMAkrqwFyaqWkOERD2qMAFuL7AYdH3ZNcO3BLhQWOtcG6arjFLktg_sVZN-MV1GqMHNhXah9qZ_eoIYAvOwyqPhS4XOLiEnqK9b7VfPeMHPxA2; _gat=1; __ASPCulture__=lv; font_size=2', 
			...data.getHeaders()
		},
		data : data
	};

	axios(config).then(response => {
		const content = response.data
		const root = parse(content)

		const $resultsList = root.querySelector('#results')
		const $results = $resultsList.querySelectorAll('.search-result-block h2 > a')

		for(let resultI in $results) {
			const $result = $results[resultI]
			const url = 'https://manas.tiesas.lv/' + $result.getAttribute('href')
			
			https.get(url, response => {
				const filename = response.headers['content-disposition'].split('=')[1]
				const writeableStream = fs.createWriteStream(CASEDIR + '/' + filename)

				response.on('data', chunk => {
					console.log('downloading chunk...')
					writeableStream.write(chunk)
				})

				response.on('end', () => {
					console.log('downloaded file ' + filename + '!')
					writeableStream.close()
					if(resultI == $results.length-1) {
						res.send('downloaded files')
					}
				})
			})
		}

	})
	.catch(error => {
		res.json(error)
	})
})

app.get('/api/cases', (req, res) => {
	fs.readdir(CASEDIR, (err, files) => {
		res.json(files)
	})
})
app.get('/api/cases/:filename', (req, res) => {
	const filename = req.params.filename
	let dataBuffer = fs.readFileSync(CASEDIR + '/' + filename)

	pdf(dataBuffer).then(data => {
		console.log("document pdf: ", data.info)
		res.send(data.text)
	})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
