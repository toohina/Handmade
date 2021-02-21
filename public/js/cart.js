// function changeQty(){
//     let cartItems=document.querySelectorAll(".qty");
//     for(var i;i<cartItems.length;i++){
//         console.log(i,cartItems[i].value);
//         fetch("/incQty",{
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json"
//                 // "Accept":"application/json"
//             },
//             body:JSON.stringify({
//                     index:i,
//                     qty: cartItems[i].value
//             })
//         });
//     }  
// }