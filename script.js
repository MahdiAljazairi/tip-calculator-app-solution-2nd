var form = document.forms["form"];

var inBill = form.elements["bill"];
var inTip = form.elements["tip"];
var inCustomTip = inTip[5];
var inPeople = form.elements["people"];

var outTipAmount = form.elements["tip-amount"];
var outTotal = form.elements["total"];
var btnReset = form.elements["reset"];


function hideAlerts(el){
  if (!/(bill|customtip|people|red-only)?/.test(el))
    throw "hideAlerts() arg invalid";
  
  var w;
  
  if (el == "" || el == "red-only")
    w = form.getElementsByClassName("alert");
  else w = form.getElementsByClassName("alert-" + el);
  
  for (var i = 0; i < w.length; i++){
    if (el == "red-only" && w[i].classList.contains("blue"))
      continue;
    
    w[i].classList.remove("show");
  }
}

function showAlert(al){
  if (!/alert-(bill|customtip|people)-(nan|neg|zero|frac|custom|floored)/.test(al))
    throw "showAlert() arg invalid";
  
  if (al.includes("bill")) hideAlerts("bill");
  else if (al.includes("customtip")) hideAlerts("customtip");
  else if (al.includes("people")) hideAlerts("people");
  
  document.getElementById(al).classList.add("show");
}

function hasValue(x, inclZero=false){
  if (x.value !== "" && (+x.value || inclZero)){
    return true;
  }
  return false;
}

function calculate(b, t, p){
  var x = b / Math.trunc(p);
  var y = t / 100;
  var z = x * y;
  return [z, x + z];
}

function zeroOutputs(){
  outTipAmount.innerText = "$0.00";
  outTotal.innerText = "$0.00";
}


form.addEventListener("reset", function(e){
  btnReset.disabled = true;
  hideAlerts("");
  zeroOutputs();
});

form.addEventListener("change", function(e){
  btnReset.disabled = false;
  
  if (hasValue(inCustomTip, true))
    showAlert("alert-customtip-custom");
  else hideAlerts("customtip");
  
  // If `inPeople.value` is 0 or "", the unary plus will return 0,
  // which is an integer. So nothing would happen.
  if (!Number.isInteger(+inPeople.value)) showAlert("alert-people-floored");
  else hideAlerts("people");
  
  if (!form.reportValidity()){
    zeroOutputs();
    return;
  }
  else hideAlerts("red-only");
  
  if (hasValue(inBill) && hasValue(inPeople)){
    var q;
    
    if (hasValue(inCustomTip, true))
      q = calculate(inBill.value,inCustomTip.value,inPeople.value);
    else if (hasValue(inTip)) q = calculate(inBill.value,inTip.value,inPeople.value);
    else q = calculate(inBill.value,0,inPeople.value);
    
    outTipAmount.innerText = "$" + (+q[0]).toPrecision(4).replace(/(?<=\.\d\d)0+$/,"");
    outTotal.innerText = "$" + (+q[1].toFixed(2)).toPrecision(4).replace(/(?<=\.\d\d)0+$/,"");
    
  } else {
    zeroOutputs();
  }
});

inBill.addEventListener("invalid", function(e){
  if (isNaN(inBill.value)) showAlert("alert-bill-nan");
  else if (+inBill.value < 0) showAlert("alert-bill-neg");
});

inCustomTip.addEventListener("invalid", function(e){
  if (isNaN(inCustomTip.value)) showAlert("alert-customtip-nan");
  else if (+inCustomTip.value < 0) showAlert("alert-customtip-neg");
});

inPeople.addEventListener("invalid", function(e){
  if (isNaN(inPeople.value)) showAlert("alert-people-nan");
  else if (+inPeople.value < 0) showAlert("alert-people-neg");
  else if (+inPeople.value == 0) showAlert("alert-people-zero");
  else if (+inPeople.value < 1) showAlert("alert-people-frac");
});


