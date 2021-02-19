exports.generateOtp=()=>{
    
        // var randVal = minVal+(Math.random()*(maxVal-minVal));
        var num=Math.floor(100000+Math.random()*(999999-100000)) ;   //Any number between 100 000 and 999 999
        var otp=num.toString();
        return otp;
}


