

//when the cart page is loaded
var priceText=document.querySelectorAll(".card-text");
var qtyText=document.querySelectorAll(".qty");
var price=[];
var qty=[];


for(var i=0;i<qtyText.length;i++){
    price.push(Number(priceText[i].innerHTML.replace("Rs","")));
    qty.push(Number(qtyText[i].defaultValue));
}

var sum=0;
for(var i=0;i<qty.length;i++){
    sum+=price[i]*qty[i];
}

document.querySelector(".total").innerHTML="Total Rs: "+sum;


//when the quantity is changed
for(var i=0;i<qty.length;i++){
    qtyText[i].addEventListener("input",function(event){
        var priceOnCard=document.querySelectorAll(".card-text");
        var qtyAll=document.querySelectorAll(".qty");
        var priceArray=[];
        var qtyArray=[];
        for(var k=0;k<qtyAll.length;k++){
            priceArray.push(Number(priceOnCard[k].innerHTML.replace("Rs","")));
            qtyArray.push(Number(qtyAll[k].defaultValue));
        }

        console.log(i);
        //qtyArray[i]=event.target.value;
        var totalSum=0;
        for(var j=0;j<qty.length;j++){
            totalSum+=priceArray[j]*qtyArray[j];
        }
        console.log(totalSum);
        document.querySelector(".total").innerHTML="Total Rs: "+totalSum+ " ";
    });
}