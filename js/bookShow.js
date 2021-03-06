const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const movieSelect = document.getElementById('movie');
const movie = JSON.parse(localStorage.getItem('movie'));
let ticketPrice = movie.price;

populateUI();

//save selected movie index and the price
function setMovieData(movieIndex, moviePrice) {
  localStorage.setItem('selectedMovieIndex', movieIndex);
  localStorage.setItem('selectedMoviePrice', moviePrice);
}

function fetchEntities(url) {
  return fetch(url).then(response => response.json());
}

async function fillDropdown() {
  const shows = await fetchEntities('http://localhost:8080/api/shows/movie/' + movie.id);
  const dropdown = document.getElementById('movie');

  shows.forEach(show => dropdown.appendChild(new Option(show.startDate, show.id)));
}

fillDropdown();

//update totalt price and count
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected'); //alle selected seats der bliver trykket på (de bliver sat i et array)
  //gemmer seatets index
  const seatsIndex = [...selectedSeats].map(function (seat) {
    return [...seats].indexOf(seat);
  });

//local storage så selvom man refresher gemmer browseren det man har trykket på
  localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex)); //da seatsIndex er et array skal vi bruge json.stringify

  const selectedSeatsCount = selectedSeats.length; //et tal på hvor mange selected seats der er trykket på

  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
}

//get data from localStorage and populate the ui
function populateUI() {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats')); //tilbage fra string til array igen

  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.indexOf(index) > -1) {
        seat.classList.add('selected');
      }
    });
  }

  const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');

  if (selectedMovieIndex != null) {
    movieSelect.selectedIndex = selectedMovieIndex;
  }
}

//movie select event, denne funktion gør at den regner ny pris når man skifter film, og ikke sidder fast på første pris
movieSelect.addEventListener('change', event => {

    setMovieData(event.target.selectedIndex, event.target.value);
    updateSelectedCount(); //her går vi igen igennem alle de selected seats der er valgt, og regner prisen ud
  }
)

container.addEventListener('click', (event) => {
  if (event.target.classList.contains('seat') && !event.target.classList.contains('occupied')) { //kun 'seats' og ikke 'occupied'
    event.target.classList.toggle('selected'); //gemmer den seat man trykker på som 'selected' seat

  }

  updateSelectedCount();
});

updateSelectedCount();

function setTitle() {
  const showMovie = document.getElementById("title");
  showMovie.classList.add("title");
  showMovie.innerText = movie.name;
}

setTitle();


const submitBtn = document.getElementById("submit");
let form = document.getElementById("myForm");
submitBtn.addEventListener("click", async () => {
  await createFormEventListener();
  location.reload();
});


function createFormEventListener() {

  form.addEventListener("submit", handleFormSubmit);
  //alert(form.getAttribute("movie"));
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const formEvent = event.currentTarget;
  const url = formEvent.action;

  try {
    const formData = new FormData(formEvent);
    await postFormDataAsJson(url, formData);
  } catch (err) {

  }
}

async function postFormDataAsJson(url, formData) {
  const seats = JSON.parse( localStorage.getItem("selectedSeats"));
  const showId = document.getElementById("movie").value;
  const plainFormData = Object.fromEntries(formData.entries());

  const reservedSeat = {};

  reservedSeat.seat = {};
  reservedSeat.seat.id = seats[0]+1;

  reservedSeat.booking = {};
  reservedSeat.booking.customer = {};
  reservedSeat.booking.customer.name = plainFormData.name;
  reservedSeat.booking.customer.email = plainFormData.email;

  reservedSeat.booking.show = {};
  reservedSeat.booking.show.id = showId;

  let formDataJsonString = JSON.stringify(reservedSeat);


  const fetchOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: formDataJsonString
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}






