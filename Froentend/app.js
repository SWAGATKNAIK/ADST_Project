
/* =========================================================
   SMARTAGRI AI - SINGLE FILE JAVASCRIPT
   AUTH: Phone Number is the account identifier.
   Aadhaar Card Number is used as the credential (as requested).
   No email field anywhere in the auth flow.
========================================================= */

let currentUser=null;

const crops={
Tomato:{icon:"🍅",price:30,yield:2000,cost:40000,demand:"High",risk:"Medium"},
Onion:{icon:"🧅",price:28,yield:2200,cost:45000,demand:"High",risk:"Medium"},
Potato:{icon:"🥔",price:26,yield:2400,cost:38000,demand:"High",risk:"Medium"},
Carrot:{icon:"🥕",price:24,yield:1800,cost:35000,demand:"Medium",risk:"Low"},
Cabbage:{icon:"🥬",price:20,yield:2500,cost:32000,demand:"Medium",risk:"Low"},
Cauliflower:{icon:"🥦",price:25,yield:1900,cost:36000,demand:"Medium",risk:"Medium"},
Brinjal:{icon:"🍆",price:27,yield:2100,cost:39000,demand:"Medium",risk:"Medium"},
Capsicum:{icon:"🫑",price:38,yield:1700,cost:50000,demand:"High",risk:"Medium"}
};

let markets={
Tomato:[["KR Market",32,45,2000],["Yeshwanthpur APMC",30,18,1500],["Hosur Market",28,55,1500],["Anekal Market",26,45,1000]],
Onion:[["KR Market",34,45,2000],["Yeshwanthpur APMC",31,18,1500],["Hosur Market",29,55,1500],["Anekal Market",27,45,1000]],
Potato:[["KR Market",28,45,1500],["Yeshwanthpur APMC",30,18,1500],["Hosur Market",27,55,1200],["Anekal Market",25,45,1000]],
Carrot:[["KR Market",29,45,1500],["Yeshwanthpur APMC",31,18,1800],["Hosur Market",26,55,1300],["Anekal Market",24,45,1100]],
Cabbage:[["KR Market",21,45,1200],["Yeshwanthpur APMC",23,18,1200],["Hosur Market",20,55,1000],["Anekal Market",19,45,900]],
Cauliflower:[["KR Market",27,45,1400],["Yeshwanthpur APMC",29,18,1600],["Hosur Market",25,55,1200],["Anekal Market",23,45,1000]],
Brinjal:[["KR Market",30,45,1600],["Yeshwanthpur APMC",28,18,1400],["Hosur Market",26,55,1300],["Anekal Market",25,45,1000]],
Capsicum:[["KR Market",42,45,2200],["Yeshwanthpur APMC",40,18,2000],["Hosur Market",38,55,1800],["Anekal Market",35,45,1500]]
};

let trucks=[
{number:"KA-01-AB-1234",driver:"Ravi Kumar",type:"Open Truck",capacity:2,charge:45},
{number:"KA-01-CD-5678",driver:"Suresh",type:"Covered Truck",capacity:2,charge:50},
{number:"KA-02-EF-9012",driver:"Manoj",type:"Mini Truck",capacity:2,charge:40}
];

let bookings=JSON.parse(localStorage.getItem("smartAgriBookings")||"[]");

/* ================= COMMON ================= */

function toast(message){
const t=document.getElementById("toast");
t.innerText=message;
t.classList.add("show");
setTimeout(()=>{t.classList.remove("show");},2500);
}

function hideAll(){
["homePage","authPage","farmerApp","transporterApp"].forEach(id=>{
document.getElementById(id).classList.add("hidden");
});
}

function showHome(){
hideAll();
document.getElementById("homePage").classList.remove("hidden");
}

function showLogin(role="farmer"){
hideAll();
document.getElementById("authPage").classList.remove("hidden");
document.getElementById("authRole").value=role;
loginMode();
}

function showRegister(){
hideAll();
document.getElementById("authPage").classList.remove("hidden");
registerMode();
}

function loginMode(){
document.getElementById("authTitle").innerText="Login";
document.getElementById("authText").innerText="Login to your SmartAgri account.";
document.getElementById("authButton").innerText="Login";
document.getElementById("confirmBox").classList.add("hidden");
document.getElementById("nameBox").classList.add("hidden");
document.getElementById("phoneBox").classList.remove("hidden");
document.getElementById("switchText").innerText="Don't have an account?";
document.getElementById("switchBtn").innerText="Register";
}

function registerMode(){
document.getElementById("authTitle").innerText="Create Account";
document.getElementById("authText").innerText="Register as farmer or transporter.";
document.getElementById("authButton").innerText="Create Account";
document.getElementById("confirmBox").classList.remove("hidden");
document.getElementById("nameBox").classList.remove("hidden");
document.getElementById("phoneBox").classList.remove("hidden");
document.getElementById("switchText").innerText="Already have an account?";
document.getElementById("switchBtn").innerText="Login";
}

function toggleAuth(){
if(document.getElementById("confirmBox").classList.contains("hidden")){
registerMode();
}else{
loginMode();
}
}

function submitAuth(){

let role=document.getElementById("authRole").value;
let name=document.getElementById("authName").value.trim();
let phone=document.getElementById("authPhone").value.trim();
let password=document.getElementById("authPassword").value;

let registering=!document.getElementById("confirmBox").classList.contains("hidden");

if(registering){

let confirm=document.getElementById("authConfirm").value;

if(!name||!phone||!password){
toast("Please fill all fields.");
return;
}

if(!/^\d{10}$/.test(phone)){
toast("Phone number must be exactly 10 digits.");
return;
}

if(!/^\d{12}$/.test(password)){
toast("Aadhaar Number must be exactly 12 digits.");
return;
}

if(password!==confirm){
toast("Aadhaar numbers do not match.");
return;
}

let users=JSON.parse(localStorage.getItem("smartAgriUsers")||"[]");

if(users.some(u=>u.phone===phone)){
toast("An account with this phone number already exists.");
return;
}

users.push({name,phone,role,password});
localStorage.setItem("smartAgriUsers",JSON.stringify(users));

toast("Account created successfully. Please log in.");

setTimeout(()=>{loginMode();},800);

return;

}

/* LOGIN */

if(!phone||!password){
toast("Please enter phone number and Aadhaar number.");
return;
}

/* Demo accounts */

if(role==="farmer" && phone==="9999999999" && password==="123456789012"){
currentUser={name:"Ramesh",phone,role};
showFarmer();
return;
}

if(role==="transporter" && phone==="8888888888" && password==="123456789012"){
currentUser={name:"Ravi",phone,role};
showTransporter();
return;
}

/* Registered accounts */

let users=JSON.parse(localStorage.getItem("smartAgriUsers")||"[]");
let match=users.find(u=>u.phone===phone && u.password===password && u.role===role);

if(match){
currentUser={name:match.name,phone:match.phone,role:match.role};

if(match.role==="farmer"){
showFarmer();
}else{
showTransporter();
}

}else{
toast("Invalid login. Demo phone: 9999999999 (farmer) / 8888888888 (transporter) — Aadhaar 123456789012");
}

}

/* ================= FARMER ================= */

function showFarmer(){
hideAll();
document.getElementById("farmerApp").classList.remove("hidden");
document.getElementById("farmerName").innerText=currentUser?.name||"Farmer";
farmerPage("dashboard");
}

function farmerPage(page,button=null){

const pages=["dashboard","forecast","calendar","market","profit","risk","transport","bookings"];

pages.forEach(p=>{
document.getElementById("farmer-"+p).classList.add("hidden");
});

document.getElementById("farmer-"+page).classList.remove("hidden");

document.querySelectorAll("#farmerApp .side-btn").forEach(b=>b.classList.remove("active"));

if(button)button.classList.add("active");

if(page==="calendar"){loadCalendar();}
if(page==="market"){showMarket();}
if(page==="transport"){loadTrucks();}
if(page==="bookings"){loadBookings();}

}

/* ================= AI FORECAST ================= */

/* URL of the Flask ML API (train_model.py + app.py in /ml_backend).
   Change this if you deploy the API somewhere other than localhost. */
const ML_API_URL="http://127.0.0.1:5000/predict";

async function generateForecast(){

let area=Number(document.getElementById("forecastArea").value)||1;
let month=document.getElementById("forecastMonth").value;
let location=document.getElementById("forecastLocation").value;

let payload={
N:Number(document.getElementById("forecastN").value),
P:Number(document.getElementById("forecastP").value),
K:Number(document.getElementById("forecastK").value),
temperature:Number(document.getElementById("forecastTemp").value),
humidity:Number(document.getElementById("forecastHumidity").value),
ph:Number(document.getElementById("forecastPh").value),
rainfall:Number(document.getElementById("forecastRainfall").value)
};

document.getElementById("forecastResult").innerHTML=
`<div class="alert info">🧠 Running trained model...</div>`;

let data;

try{

let response=await fetch(ML_API_URL,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
});

if(!response.ok){
throw new Error("API returned status "+response.status);
}

data=await response.json();

}catch(err){

document.getElementById("forecastResult").innerHTML=`

<div class="alert warning">
⚠️ Could not reach the ML API at <code>${ML_API_URL}</code>.
Make sure the Flask server is running:
<br><br>
<code>cd ml_backend && python3 app.py</code>
<br><br>
Error: ${err.message}
</div>

`;

return;

}

let html=`

<div class="recommend">
<h2>🧠 AI Recommendation: ${data.recommended_crop.toUpperCase()}</h2>
<p>
Based on the soil (N-P-K, pH) and climate (temperature, humidity, rainfall)
values entered for <b>${location}</b> in <b>${month}</b> on
<b>${area} acre(s)</b>, the trained model recommends
<b>${data.recommended_crop}</b>.
</p>
<br>
<b>Model Confidence: ${data.confidence}%</b>
<div class="progress"><span style="width:${data.confidence}%"></span></div>
</div>

<div class="table-wrap">
<table>
<thead>
<tr><th>Rank</th><th>Crop</th><th>Confidence</th></tr>
</thead>
<tbody>
${data.top_3.map((r,i)=>`
<tr class="${i===0?"best":""}">
<td>${i+1}</td>
<td><b>${r.crop}</b></td>
<td>${r.confidence}%</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="alert info">
🧠 Prediction from a Random Forest model trained on 2,200 real soil/climate
samples across 22 crops (99.5% test accuracy). This list covers cereals,
pulses, fruits and cash crops — it does not include the vegetables
(tomato, onion, etc.) used in the Market Prices / Profit Calculator pages,
since those come from a separate public dataset. If you need the model to
recommend vegetables specifically, it needs to be retrained on a
vegetable-focused dataset.
</div>

`;

document.getElementById("forecastResult").innerHTML=html;

}

function clearForecast(){
document.getElementById("forecastResult").innerHTML="";
}

/* ================= CROP CALENDAR ================= */

function loadCalendar(){

let data={
January:["🥕 Carrot","🥬 Cabbage","🥔 Potato"],
February:["🥕 Carrot","🥔 Potato","🍅 Tomato"],
March:["🥭 Mango","🍉 Watermelon","🧡 Papaya"],
April:["🥭 Mango","🍉 Watermelon"],
May:["🥭 Mango","🍉 Watermelon"],
June:["🌱 Maize","🌱 Soybean","🌱 Groundnut"],
July:["🌱 Maize","🌱 Turmeric","🌱 Paddy"],
August:["🧅 Onion","🍅 Tomato","🌶️ Chilli"],
September:["🧅 Onion","🍅 Tomato","🥒 Cucumber"],
October:["🧅 Onion","🍅 Tomato","🥕 Carrot"],
November:["🧅 Onion","🥔 Potato","🥬 Cabbage"],
December:["🥔 Potato","🥕 Carrot","🥬 Cabbage"]
};

document.getElementById("calendarGrid").innerHTML=
Object.entries(data).map(([month,cropList])=>`
<div class="month">
<h3>${month}</h3>
${cropList.map(c=>`<span class="chip">${c}</span>`).join("")}
<br><br>
<small class="muted">Use AI forecast to estimate profitability.</small>
</div>
`).join("");

}

/* ================= MARKET ================= */

async function showMarket() {
    const crop = document.getElementById("marketCrop").value;
    const state = document.getElementById("marketState")?.value || "Karnataka";

    const message = document.getElementById("marketMessage");
    const table = document.getElementById("marketTable");

    message.innerText = "Loading market prices...";
    table.innerHTML = "";

    try {
        const url =
            "http://localhost:5000/market-prices" +
            "?crop=" + encodeURIComponent(crop) +
            "&state=" + encodeURIComponent(state);

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to load prices");
        }

        const data = result.data || [];

        if (data.length === 0) {
            message.innerText = "No recorded prices found for " + crop + ".";
            return;
        }

        const prices = data.map(row => Number(row.modal_price) || 0);
        const bestPrice = Math.max(...prices);

        message.innerText =
            crop + " — highest recorded modal price: ₹" +
            bestPrice.toLocaleString("en-IN") +
            " per quintal. Data is from your CSV.";

        table.innerHTML = data.map(row => {
            const minPrice = Number(row.min_price) || 0;
            const maxPrice = Number(row.max_price) || 0;
            const modalPrice = Number(row.modal_price) || 0;

            return `
                <tr class="${modalPrice === bestPrice ? "best" : ""}">
                    <td>${row.market || "—"}</td>
                    <td>₹${minPrice.toLocaleString("en-IN")}</td>
                    <td>₹${maxPrice.toLocaleString("en-IN")}</td>
                    <td>₹${modalPrice.toLocaleString("en-IN")}</td>
                    <td>${row.date || "2026-07-02"}</td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Market prices error:", error);
        message.innerText =
            "Could not load prices. Make sure Flask is running and check the CSV/API columns.";
    }
}


/* ================= PROFIT ================= */

function calculateProfit(){

let crop=document.getElementById("profitCrop").value;
let area=Number(document.getElementById("profitArea").value);
let price=Number(document.getElementById("profitPrice").value);
let yieldA=Number(document.getElementById("profitYield").value);

let costs=
Number(document.getElementById("seeds").value)+
Number(document.getElementById("fertilizer").value)+
Number(document.getElementById("labour").value)+
Number(document.getElementById("irrigation").value)+
Number(document.getElementById("pesticide").value)+
Number(document.getElementById("profitTransport").value);

let revenue=price*yieldA*area;
let profit=revenue-costs;

document.getElementById("profitResult").innerHTML=`

<div class="cards" style="margin-top:20px">
<div class="card"><h3>🌾 Crop</h3><h2>${crop}</h2></div>
<div class="card"><h3>💵 Expected Revenue</h3><h2 style="color:#087443">₹${revenue.toLocaleString("en-IN")}</h2></div>
<div class="card"><h3>💰 Expected Profit</h3><h2 style="color:${profit>=0?"#087443":"#dc3545"}">₹${profit.toLocaleString("en-IN")}</h2></div>
</div>

<div class="alert ${profit>=0?"success":"warning"}">
${profit>=0?"Estimated positive return based on the values entered.":"Estimated loss based on the values entered."}
</div>

`;

}

/* ================= RISK ================= */

async function riskAnalysis() {
    const crop = document.getElementById("riskCrop").value;

    const priceRisk = document.getElementById("priceRisk");
    const demandRisk = document.getElementById("demandRisk");

    priceRisk.innerHTML = "Checking recorded prices...";
    demandRisk.innerHTML = "Demand data unavailable";

    try {
        const response = await fetch(
            "http://localhost:5000/market-prices?crop=" +
            encodeURIComponent(crop)
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error("Could not load market prices");
        }

        const data = result.data || [];

        if (data.length < 2) {
            priceRisk.innerHTML =
                "Not enough price records to calculate risk.";
            return;
        }

        const prices = data
            .map(row => Number(row.modal_price))
            .filter(price => Number.isFinite(price) && price > 0);

        if (prices.length < 2) {
            priceRisk.innerHTML = "Price data unavailable.";
            return;
        }

        const average =
            prices.reduce((sum, price) => sum + price, 0) / prices.length;

        const variation =
            Math.sqrt(
                prices.reduce(
                    (sum, price) => sum + Math.pow(price - average, 2), 0
                ) / prices.length
            ) / average * 100;

        const risk =
            variation < 10 ? "Low" :
            variation < 25 ? "Medium" : "High";

        priceRisk.innerHTML =
            `<b>${risk} Risk</b><br>` +
            `Price variation: ${variation.toFixed(1)}%`;

        demandRisk.innerHTML =
            "Demand data unavailable. Add market arrival data.";

    } catch (error) {
        console.error(error);
        priceRisk.innerHTML = "Could not load price data.";
        demandRisk.innerHTML = "Demand data unavailable.";
    }
}


/* ================= TRANSPORT ================= */

function loadTrucks(){

document.getElementById("truckTable").innerHTML=

trucks.map((t,i)=>`
<tr>
<td>${t.number}</td>
<td>${t.type}</td>
<td>${t.capacity} Ton</td>
<td>₹${t.charge}/km</td>
<td><span class="tag low">Available</span></td>
<td><button class="btn green" onclick="bookTruck(${i})">Book</button></td>
</tr>
`).join("");

}

function bookTruck(index){

let crop=prompt("Enter crop/product","Tomato");
if(!crop)return;

let quantity=prompt("Enter quantity in tons","1");
if(!quantity)return;

let t=trucks[index];

let booking={
id:"BK"+Date.now(),
farmer:currentUser?.name||"Farmer",
crop,
quantity,
truck:t.number,
route:"Farm → KR Market",
status:"Pending"
};

bookings.push(booking);
localStorage.setItem("smartAgriBookings",JSON.stringify(bookings));

toast("Transport booking request sent!");

}

/* ================= BOOKINGS ================= */

function loadBookings(){

bookings=JSON.parse(localStorage.getItem("smartAgriBookings")||"[]");

document.getElementById("bookingCount").innerText=bookings.length;

if(bookings.length===0){
document.getElementById("bookingTable").innerHTML=
`<tr><td colspan="6" style="text-align:center;padding:30px">No bookings yet.</td></tr>`;
return;
}

document.getElementById("bookingTable").innerHTML=

bookings.map(b=>`
<tr>
<td>${b.id}</td>
<td>${b.crop}</td>
<td>${b.quantity} Ton</td>
<td>${b.truck}</td>
<td>${b.route}</td>
<td><span class="tag ${b.status==="Accepted"?"low":b.status==="Rejected"?"high":"medium"}">${b.status}</span></td>
</tr>
`).join("");

}

/* ================= TRANSPORTER ================= */

function showTransporter(){
hideAll();
document.getElementById("transporterApp").classList.remove("hidden");
transPage("dashboard");
}

function transPage(page,button=null){

let pages=["dashboard","trucks","capacity","charges","requests"];

pages.forEach(p=>{
document.getElementById("trans-"+p).classList.add("hidden");
});

document.getElementById("trans-"+page).classList.remove("hidden");

document.querySelectorAll("#transporterApp .side-btn").forEach(b=>b.classList.remove("active"));

if(button)button.classList.add("active");

if(page==="dashboard"){loadTransportRequests();}
if(page==="trucks"){loadMyTrucks();}
if(page==="requests"){loadTransportRequests();}

}

function addTruck(){

let number=prompt("Truck Number","KA-01-XX-0000");
if(!number)return;

let driver=prompt("Driver Name","New Driver");
if(!driver)return;

let capacity=Number(prompt("Maximum Capacity in Ton","2"));
if(!capacity)return;

let charge=Number(prompt("Charge per KM","45"));

trucks.push({number,driver,type:"Open Truck",capacity,charge});

toast("Truck added successfully!");

loadMyTrucks();

document.getElementById("truckCount").innerText=trucks.length;

}

function loadMyTrucks(){

document.getElementById("myTruckTable").innerHTML=

trucks.map(t=>`
<tr>
<td>${t.number}</td>
<td>${t.driver}</td>
<td>${t.type}</td>
<td>${t.capacity} Ton</td>
<td>0 Ton</td>
<td>${t.capacity} Ton</td>
<td>₹${t.charge}/km</td>
</tr>
`).join("");

}

function calculateSpace(){

let max=Number(document.getElementById("maxCapacity").value);
let current=Number(document.getElementById("currentLoad").value);
let available=Math.max(0,max-current);

document.getElementById("availableSpace").value=available;

}

function saveCapacity(){
calculateSpace();
toast("Capacity updated successfully!");
}

function saveCharge(){

let amount=document.getElementById("chargeAmount").value;

if(!amount){
toast("Enter transport charge.");
return;
}

toast("Transport charges saved!");

}

function loadTransportRequests(){

bookings=JSON.parse(localStorage.getItem("smartAgriBookings")||"[]");

let pending=bookings.filter(b=>b.status==="Pending");

document.getElementById("pendingCount").innerText=pending.length;

let html=

bookings.length?

bookings.map((b,i)=>`
<tr>
<td>${b.farmer}</td>
<td>${b.crop}</td>
<td>${b.quantity} Ton</td>
<td>${b.truck}</td>
<td>${b.route}</td>
<td>
${
b.status==="Pending"?
`<button class="btn green" onclick="acceptBooking(${i})">Accept</button>
<button class="btn red" onclick="rejectBooking(${i})">Reject</button>`
:
`<span class="tag ${b.status==="Accepted"?"low":"high"}">${b.status}</span>`
}
</td>
</tr>
`).join("")

:

`<tr><td colspan="6" style="text-align:center;padding:30px">No booking requests.</td></tr>`;

document.getElementById("requestTable").innerHTML=html;

document.getElementById("transRequests").innerHTML=
bookings.length?
`<p>${pending.length} pending request(s)</p>`
:
`<p class="muted">No booking requests.</p>`;

}

function acceptBooking(index){
bookings[index].status="Accepted";
localStorage.setItem("smartAgriBookings",JSON.stringify(bookings));
toast("Booking accepted.");
loadTransportRequests();
}

function rejectBooking(index){
bookings[index].status="Rejected";
localStorage.setItem("smartAgriBookings",JSON.stringify(bookings));
toast("Booking rejected.");
loadTransportRequests();
}

/* ================= LOGOUT ================= */

function logout(){
currentUser=null;
showHome();
toast("Logged out successfully.");
}

/* ================= START ================= */

async function loadWeather() {
    const temp = document.getElementById("temp");
    const humidity = document.getElementById("humidity");

    try {
        const response = await fetch("http://127.0.0.1:5000/weather");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Weather API failed");
        }

        temp.innerText = data.temperature + " °C";
        humidity.innerText = "Humidity: " + data.humidity + "%";

    } catch (error) {
        temp.innerText = "Weather unavailable";
        humidity.innerText = "API Error";
        console.error("Weather API error:", error);
    }
}

loadWeather();
showHome();

