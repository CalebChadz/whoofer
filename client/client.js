console.log("test thhat console")

const form = document.querySelector('form');
const loadingElement = document.querySelector('.loading');
const woofsElement = document.querySelector('.woofs');

//the server that i am making requests to.
const API_URL = 'http://localhost:5000/woofs';

loadingElement.style.display = '';

//function for when the page loads to get all the woofs from db and present them
listAllWoofs();

form.addEventListener('submit', (event) => {
    //stop the form from trying to submit the data somewhere.
    event.preventDefault();

    //using the built in FormData function, pass it a form reference and will allow us to collect form data easily
    const formData = new FormData(form);
    const name = formData.get('name');
    const content = formData.get('content');

    //now I can create the object format for a woof that holds the name and message or content
    const woof = {
        name, 
        content
    };

    //hide the form ad show th loading wheel.
    loadingElement.style.display = '';
    form.style.display = "none";

    //print the post to the console
    //console.log(woof);

    //send the post to the server as a json object.
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(woof),
        headers: {
            'content-type': 'application/json'
        }
      //get the response and return it to a json object that we are expecting
    }).then(response => response.json())
      //log that object to the console.
      .then(createdWoof => {
          //hide the spinner since the request has completed. show the form. reset the form
          form.reset();
          setTimeout(() => {
            form.style.display = '';
          }, 30000)
          listAllWoofs();
      });
});

function listAllWoofs() {
    //clear all existing data to refresh
    woofsElement.innerHTML = '';
    //fetch the  woofs from the database.
    fetch(API_URL)
        //parse the response as json
        .then(response => response.json())
        //write them all to the console
        .then(woofs => {
            console.log(woofs);
            //reverse the order of the woofs to show mmost recent at top
            woofs.reverse();
            woofs.forEach(woof => {
                //create a new div for the woof
                const div = document.createElement('div');
                //get the name and make a header element for this
                const header = document.createElement('h3');
                header.textContent = woof.name;
                //get the content of woof and create a paragraph for this
                const contents = document.createElement('p');
                contents.textContent = woof.content;
                //create a date element to add
                const date = document.createElement('small');
                date.textContent = new Date(woof.created);
                //apend all tags to the div ready for page insertion.
                div.appendChild(header);
                div.appendChild(contents);
                div.appendChild(date);

                woofsElement.appendChild(div);
            });
            loadingElement.style.display = 'none';
        });
}