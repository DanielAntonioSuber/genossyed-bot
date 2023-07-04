import { isJidUser, proto, WASocket } from "@whiskeysockets/baileys"

export async function nowa(waInfo: proto.IWebMessageInfo, sock: WASocket) {
    const numberVerify = /\d|x/i
    const numberPhone = waInfo.message?.conversation?.split(" ")[1]!

    if(numberVerify.test(numberPhone)) {
        const digits = numberPhone.match(new RegExp("x", "g"))?.length!
        const max = parseInt("9".repeat(digits));
        let verifiedNumbers = ""
        let unVerifiedNumbers = "" 
        
        for(let i = 0; i <= max; i++) {
            const number = numberPhone.replace("x".repeat(digits), addZeros(i, digits));
            console.log(`${number}@s.whatsapp.net`);
            const status = isJidUser(`${number}@s.whatsapp.net`)
            sock.query
          
            if(status ) {
                verifiedNumbers += `wa.me//+${number}\n`
            } else {
                unVerifiedNumbers + `${number}\n`
            }
            
        }
        const text = `Números verificados \n${verifiedNumbers}\n números no verificados \n${unVerifiedNumbers}`
        await sock.sendMessage( waInfo.key.remoteJid!, { text: text}, {quoted: waInfo} )
    }
}

function addZeros(numero: number, cantidadCeros: number) {
    let numeroString = numero.toString();
    let cerosFaltantes = cantidadCeros - numeroString.length;
    if (cerosFaltantes > 0) {
      numeroString = "0".repeat(cerosFaltantes) + numeroString;
    }
    return numeroString;
}