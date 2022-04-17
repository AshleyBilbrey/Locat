<p align="center">
  <img 
    width="150"
    height="150"
    src="https://user-images.githubusercontent.com/16575976/163694639-9daa0eb9-b443-4493-8261-6f337a063d40.gif"
  >
</p>

<div align="center">
  Hi there! 👋 Love cats? This is the place for you!🐱♥️  


  Locat is a webapp that can be used to locate cats and know more about them. One can add information about a cat including their location. 🐈
</div>

<b>Try it now!</b>
https://locat.tech/

<br>
<img src='https://user-images.githubusercontent.com/44065883/163725897-731ec11c-90f2-4e6f-a4e6-c114850061d4.png'>
<img src='https://user-images.githubusercontent.com/44065883/163725923-4da4c46d-a5f7-41b6-9478-69b6f49c528f.png'>

<h2>Automagic of Locat</h2>     
⭐️ Want to pet a cat? Check out the cat map!🗺<br>  
⭐️ Want to add a cat? Add the catributes and you're all set!🎉<br>
⭐️ Each cat a few catributes like if it is healthy or ailing, can be pet or not, can be fed or not, its caretaker and some additonal remarks🫶🏻<br>   
⭐️ Click loads of pictures of cats and add them along with their location📍<br>   
<h3>Machine Learning</h3>
Object identification, cropping, image matting, and supervised learning make up to core of our cat identification functionality. Images are run through Google Vision to identify the cat and crop its dimensions in the picture. See an example below. <br> <br>
Following that, image matting is used to find the image mask of the being in the piction. The inverse of that mask is then multiplied with the image to exract the body of the person in the image. <br> <br>
Finally, this extracted body is analyzed for color by Google Vision to detect image color qualities. These dominant colors and their data are fed into a dense machine learning model that, along with the locational metadata of the image, are used to train the supervised model. Each image is labeled by a cats name, and those a model is trained that can identify them (reliably!). With the crowd sourcing of fresh data Locat promotes, this model will only become more accurate. 

<h2>Paw-sible Users</h2>
👤 Cheeto lovers <br>
👤 Campus explorers <br>
👤 Spay Neuter Clinics <br>
👤 Cat paw-parazzi <br>

<h2>Meow It Works</h2>
• EJS renders our HTML programmatically <br>
• Express serves user-facing files and handles HTTP requests <br>
• MongoDB stores all of the cats and their catributes <br>
• Google Cloud assists in map rendering, ML model training, and hosting. <br>

<h2>Tech Stack</h2>      
💻 <a href="https://ejs.co/">e.js</a> <br>  
💻 <a href="https://expressjs.com/">Express</a> <br>  
💻 <a href="https://developers.google.com/maps">Google Maps API</a> <br>  
💻 <a href="https://www.mongodb.com/">MongoDB</a> <br>  


<h2>Our Unfur-gettable Team</h2>
👩‍💻 <a href="https://www.linkedin.com/in/ashley-bilbrey/" target="_blank">Ashley Bilbrey</a><br>
👨‍💻 <a href="https://www.linkedin.com/in/timstewartj/" target="_blank">Tim Stewart</a><br>  
👨‍💻 <a href="https://www.linkedin.com/in/karim-abou-najm/" target="_blank">Karim Abou Najm</a><br>  
👩‍🎨 <a href="https://www.linkedin.com/in/pratibha-agarwal/" target="_blank">Pratibha Agarwal</a><br> 


<div align="center">
  <h3>Cats are Paw-some!🐾</h3>   
  Made with ❤️ in Davis 🐮 
</div>

