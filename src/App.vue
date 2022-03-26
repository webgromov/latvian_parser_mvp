<script setup>
import axios from 'axios'
import {onMounted, ref} from 'vue'
const viewsList = ref(null)
const viewArea = ref(null)

const parseContent = e => {
	e.preventDefault()
	alert('We pasing content...')
	axios.get('/api/parse')
		.then(response => {
			alert('data has been parsed')
		})
		.catch(error => {
			console.log(error.message)
		})
		.finally(() => {
			updateViews()
		})
}
const updateViews = () => {
	axios.get('/api/cases')
		.then(response => {
			console.log('cases', response.data)
			viewsList.value.innerHTML = ''
			const files = response.data
			for(let file of files) {
				const li = document.createElement('li')
				const view = document.createElement('a')
				view.className = 'independent'
				view.setAttribute('href', '/api/cases/' + file)
				view.innerText = file
				li.appendChild(view)
				viewsList.value.append(li)
			}
		})
}

onMounted(() => {
	const filedir = document.querySelector('.filedir ul')
	filedir.addEventListener('click', e => {
		if(e.target.className == 'independent') {
			e.preventDefault()
			axios.get(e.target.getAttribute('href'))
				.then(response => {
					viewArea.value.innerText = response.data
				})
		}
	})
})

onMounted(updateViews)
</script>

<template>
	<header>
		<div class="name">MVP - Nolemumi</div>
		<div class="parser">
			<h3>Parser.</h3>
			<form action="#">
				<label><input @click="parseContent" type="submit" value="Parse test content"></label>
			</form>
		</div>
		<div class="views" style="display: flex;">
			<div class="filedir" style="margin-right: 50px;">
				<h3>Documents</h3>
				<ul ref="viewsList">
				</ul>
			</div>
			<div class="viewArea" ref="viewArea" style="padding-top: 50px; max-width: 1000px;">Example text</div>
		</div>
	</header>
</template>

<style>

</style>
