import Randomstring from "randomstring"


export const GetAccountVerificationHash  = ()=>{
    return Randomstring.generate(20);
}