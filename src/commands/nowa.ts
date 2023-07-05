import { proto, WASocket } from "@whiskeysockets/baileys"

export async function nowa(webMessageInfo: proto.IWebMessageInfo, sock: WASocket) {
    const numberPhoneRegExp = /\d|x/i
    const numberPattern = webMessageInfo.message?.conversation?.split(" ")[1]!

    if(numberPhoneRegExp.test(numberPattern)) {
        let verifiedNumbers = ""
        let unVerifiedNumbers = "" 
        const digits = numberPattern.match(new RegExp("x", "g"))?.length!
        const max = parseInt("9".repeat(digits));

        await sock.sendMessage(webMessageInfo.key.remoteJid!, { text: 'Esperar a que el computo finalice.'}, {quoted: webMessageInfo} )

        for(let i = 0; i <= max; i++) {
            const numberPhone = numberPattern.replace("x".repeat(digits), addZeros(i, digits));
            const result = await sock.onWhatsApp(`${numberPhone}@s.whatsapp.net`)
            
            if(result.length !== 0) {
                verifiedNumbers += `wa.me//+${numberPhone}\n`
            } else {
                unVerifiedNumbers += `${numberPhone}\n`
            }
            
        }
        const text = `Números verificados \n${verifiedNumbers}\nNúmeros no verificados \n${unVerifiedNumbers}`
        
        await sock.sendMessage(webMessageInfo.key.remoteJid!, { text: text}, {quoted: webMessageInfo} )
    } else {
        await sock.sendMessage(webMessageInfo.key.remoteJid! , {text: 'Número incorrecto para whatsapp'})
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