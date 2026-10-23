"""The cutscene captions rewritten to invite the player in (owner, 23 Oct 2026: "they should invite the players in,
engage them, not just challenge them"). Writes them into knowledge/story/first-take-script.md, replacing each panel's
caption cell; the painted scene (the "What is painted" cell) is untouched, so the paintings still fit."""
import re
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / 'knowledge' / 'story' / 'first-take-script.md'
NEW = {
 '0.1': ('Seventy-eight years, one small tempo. Dadi is moving in.', 'अठहत्तर साल, एक छोटा-सा टेम्पो। दादी रहने आ रही हैं।'),
 '0.2': ('Dadi: "Careful with my trunk! It\'s older than all of you."', 'दादी: "मेरा संदूक ध्यान से! ये तुम सबसे पुराना है।"'),
 '0.3': ('Vikram, her son: "Ma, what\'s in here? Bricks?" Dadi: "Half a century."', 'विक्रम, उनका बेटा: "माँ, इसमें क्या है? ईंटें?" दादी: "आधी सदी।"'),
 '0.4': ('Meera, his wife: "Half a century? Then I\'m making more tea."', 'मीरा, उसकी पत्नी: "आधी सदी? तो मैं और चाय बनाती हूँ।"'),
 '0.5': ('Tara, their daughter: "Dadi, who were you before you were Dadi?"', 'तारा, उनकी बेटी: "दादी, दादी बनने से पहले आप कौन थीं?"'),
 '0.6': ('Dadi: "Five days this family still argues about."', 'दादी: "पाँच दिन, जिन पर ये परिवार आज भी बहस करता है।"'),
 '0.7': ('Dadi: "Here, beta. You make the calls. I\'ll tell you what happened."', 'दादी: "लो बेटा। फ़ैसले तुम करोगे। क्या हुआ, वो मैं बताऊँगी।"'),
 '1.1': ('My first railway pass. I slept with it under my pillow.', 'मेरा पहला रेलवे पास। तकिये के नीचे रखकर सोती थी।'),
 '1.2': ('Me at twenty-three. Manmad junction, 1971: smoke, chai and whistles.', 'मैं, तेईस साल की। मनमाड जंक्शन, 1971: धुआँ, चाय और सीटियाँ।'),
 '1.3': ('My brother Mohan fed the steam engines. And sang to them.', 'मेरा भाई मोहन भाप के इंजन में कोयला झोंकता था। और उन्हें गाना सुनाता था।'),
 '1.4': ('Then the new engines rolled in. Faster, and needing fewer hands.', 'फिर नए इंजन आए। ज़्यादा तेज़, और कम लोगों से चलने वाले।'),
 '1.9': ('Friday, dawn. The first run left on time. Half the town came.', 'शुक्रवार, सुबह-सुबह। पहली गाड़ी समय पर निकली। आधा शहर देखने आया।'),
 '1.10': ('Tara: "Did Mohan nana get the course?" Dadi: "All in good time."', 'तारा: "मोहन नाना को कोर्स मिला?" दादी: "सब्र करो, बताऊँगी।"'),
 '2.1': ("By 1977 I'd married into a trucking family. Loud, all of them.", '1977 तक मैं ट्रक वाले परिवार की बहू बन चुकी थी। सब के सब ऊँची आवाज़ वाले।'),
 '2.2': ('Bauji ran four trucks over the Kasara ghat. Nobody argued with Bauji.', 'बाऊजी के चार ट्रक कसारा घाट पर चलते थे। बाऊजी से कोई बहस नहीं करता था।'),
 '2.3': ('My husband Ramesh drove, humming film songs. Mohan rode beside him now.', 'मेरे पति रमेश फ़िल्मी गाने गुनगुनाते हुए ट्रक चलाते। अब मोहन भी साथ होता।'),
 '2.4': ('Onion season. Rain, lanterns, and talk of robbers on the ghat.', 'प्याज़ का मौसम। बारिश, लालटेन, और घाट पर लुटेरों की बातें।'),
 '2.9': ('Every truck came home that season. Muddy to the axles, but home.', 'उस मौसम हर ट्रक घर लौटा। कीचड़ में सना, पर घर।'),
 '2.10': ('Meera: "You waited up every night?" Dadi: "I counted every truck home."', 'मीरा: "आप हर रात जागती थीं?" दादी: "हर ट्रक लौटने तक गिनती रहती थी।"'),
 '3.1': ('1984. My cousin Pallavi ran away. With a magic show!', '1984। मेरी बहन पल्लवी भाग गई। एक जादू के शो के साथ!'),
 '3.2': ('Drums and lamps: the Chandni Mandal had come to the winter fair.', 'ढोल और लालटेनें: चाँदनी मंडल सर्दियों के मेले में आया था।'),
 '3.3': ("Pallavi was the magician's assistant. She knew every trick, and every secret.", 'पल्लवी जादूगर की सहायक थी। हर करतब जानती थी, और हर राज़।'),
 '3.4': ('Then, on the last night, the cash box came up short.', 'फिर, आख़िरी रात, पैसों का डिब्बा कम निकला।'),
 '3.9': ('It had slipped under the stage. Everyone laughed, mostly from relief.', 'डिब्बा मंच के नीचे खिसक गया था। सब हँसे, ज़्यादातर राहत से।'),
 '3.10': ('Tara: "Pallavi masi joined a magic show?" Dadi: "Then taught school. Same skills."', 'तारा: "पल्लवी मासी जादू के शो में थीं?" दादी: "फिर स्कूल में पढ़ाया। हुनर वही।"'),
 '4.1': ("Vikram's scorecard. Fourteen, and more serious than the players.", 'विक्रम का स्कोरकार्ड। चौदह साल का, और खिलाड़ियों से ज़्यादा गंभीर।'),
 '4.2': ('Sunday at the old ground. Two finals, one neem tree, everyone watching.', 'पुराने मैदान पर इतवार। दो फ़ाइनल, एक नीम का पेड़, और सबकी नज़रें।'),
 '4.3': ('My Rani padded up that year. Her father never missed a ball.', 'उस साल मेरी रानी ने पैड बाँधे। उसके पापा ने एक भी गेंद नहीं छोड़ी।'),
 '4.4': ('Friday night, the coach had two teams to pick. And a headache.', 'शुक्रवार रात, कोच को दो टीमें चुननी थीं। और सिरदर्द अलग।'),
 '4.9': ('Both finals went to the last over. Vikram forgot to breathe.', 'दोनों फ़ाइनल आख़िरी ओवर तक गए। विक्रम साँस लेना भूल गया।'),
 '4.10': ('Vikram: "I got the totals wrong, didn\'t I?" Dadi: "By eleven runs."', 'विक्रम: "मैंने जोड़ ग़लत किया था न?" दादी: "ग्यारह रन से।"'),
 '5.1': ("1999. We were fixing Rani's wedding, and everyone had an opinion.", '1999। रानी की शादी तय हो रही थी, और सबकी अपनी राय थी।'),
 '5.2': ('The World Cup on TV, and relatives on every mattress.', 'टीवी पर वर्ल्ड कप, और हर गद्दे पर रिश्तेदार।'),
 '5.3': ('My mother-in-law, Badi Amma, ran the whole house from that chair.', 'मेरी सास, बड़ी अम्मा, उसी कुर्सी से पूरा घर चलाती थीं।'),
 '5.4': ('Except the TV. It cut out at every good part.', 'बस टीवी उनकी नहीं सुनता था। हर अच्छे पल पर कट जाता था।'),
 '5.9': ('The date was fixed: December. Everyone slept where they fell.', 'तारीख़ तय हुई: दिसंबर। जो जहाँ थका, वहीं सो गया।'),
 '5.10': ('Tara: "Dadi, what\'s that book?" Dadi: "The part I never told anyone."', 'तारा: "दादी, वो किताब क्या है?" दादी: "वो हिस्सा, जो मैंने किसी को नहीं बताया।"'),
 '6.1': ('I wrote it all down. Every night, since I was eighteen.', 'मैंने सब लिखा। हर रात, अठारह साल की उम्र से।'),
 '6.2': ('No woman got a seat on that course. Mohan left in 1975.', 'उस कोर्स में किसी औरत को सीट नहीं मिली। मोहन 1975 में चला गया।'),
 '6.3': ('A driver asked for time with his newborn. They laughed him out.', 'एक ड्राइवर ने नवजात के लिए छुट्टी माँगी। सब हँसकर टाल गए।'),
 '6.4': ('A woman said a car followed her. Bauji said she imagined it.', 'एक औरत ने कहा, गाड़ी पीछा कर रही थी। बाऊजी बोले, वहम है।'),
 '6.5': ('They believed the man. Her statement said the same, word for word.', 'उन्होंने आदमी की बात मानी। उसका बयान भी हूबहू वही था।'),
 '6.6': ('One bad day dropped a girl. A boy kept his place.', 'एक बुरे दिन पर लड़की बाहर हुई। लड़का टीम में रहा।'),
 '6.7': ('We refused them a scooter. Rani heard about it for years.', 'हमने स्कूटर देने से मना किया। रानी को बरसों ताने सुनने पड़े।'),
 '6.8': ('Dadi: "We got plenty wrong, beta. Now, let\'s see your five days."', 'दादी: "हमसे बहुत कुछ ग़लत हुआ, बेटा। अब तुम्हारे पाँच दिन देखते हैं।"'),
 '6.9': ('Dadi: "The trunk is yours now. Fill it with better days."', 'दादी: "अब ये संदूक तुम्हारा है। इसे बेहतर दिनों से भरना।"'),
}
LABEL = re.compile(r'\b(Dadi|Tara|Meera|Vikram)(, (her son|his wife|their daughter))?: ')


def words(en):
    """Words a player reads, leaving out who is speaking."""
    return len(LABEL.sub('', en).replace('"', '').split())


if __name__ == '__main__':
    lines, done = SCRIPT.read_text(encoding='utf-8').split('\n'), set()
    for i, line in enumerate(lines):
        m = re.match(r'\| (\d+\.\d+) \|', line)
        if m and m.group(1) in NEW:
            en, hi = NEW[m.group(1)]
            assert ' / ' not in en and '—' not in en + hi and '–' not in en + hi, m.group(1)
            cells = line.rstrip().rstrip('|').split(' | ')
            lines[i] = ' | '.join(cells[:-1]) + f' | {en} / {hi} |'
            done.add(m.group(1))
    assert done == set(NEW), set(NEW) - done
    SCRIPT.write_text('\n'.join(lines), encoding='utf-8')
    over = {k: words(en) for k, (en, _) in NEW.items() if words(en) > 12}
    print(len(done), 'captions written; over 12 words:', over or 'none')
