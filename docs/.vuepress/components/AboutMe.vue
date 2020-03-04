<template>
  <p>{{ introduction }}</p>
</template>

<script>
class Typer {
  constructor(text, config, cb) {
    this.text = text;
    this.config = Object({
      typeDelay: 200,
      deleteDelay: 70,
      delDelimiters: '()',
    }, config);
    this.cb = cb;
    this.texts = [];
    this.textsIndex = 0;
    this.letterIndex = 1;
    this.typedText = '';

    this.parse();
    this.typeText();
  }

  parse() {
    const { text, config } = this
    const { delDelimiters } = config;

    const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
    const open = delDelimiters[0].replace(regexEscapeRE, '\\$&');
    const close = delDelimiters[1].replace(regexEscapeRE, '\\$&');
    const delReg = new RegExp(`(${open}(?:.|\\n)+?${close})`, 'g');

    this.texts = text.split(delReg)
      .map(v => ({
          msg: v,
          delete: !!v.match(delReg),
      }))
      .filter(v => v.msg !== '');
  }

  typeText() {
    const { texts, textsIndex, config } = this;
    const { typeDelay } = config;

    const msg = texts[textsIndex].msg;
    this.cb(this.typedText + msg.slice(0, this.letterIndex++));

    if (this.letterIndex > msg.length) {
      if (texts[textsIndex].delete) {
          setTimeout(() => {
            this.deleteText();
          }, 500);
          this.letterIndex = msg.length;
          return;
      } else {
          this.letterIndex = 1;
          this.typedText += msg;
      }
      this.textsIndex++;

      if (this.textsIndex >= texts.length) return;
    }

    setTimeout(() => {
      this.typeText();
    }, typeDelay);
  }


  deleteText() {
    const { texts, textsIndex, config } = this;
    const { deleteDelay } = config;
    const msg = texts[textsIndex].msg;
    this.cb(this.typedText + msg.slice(0, this.letterIndex-- - 1));

    if (this.letterIndex === 0) {
        this.textsIndex++;
        this.typeText();
    } else {
      setTimeout(() => {
        this.deleteText();
      }, deleteDelay);
    }
  }
}

export default {
  data() {
    return {
      introduction: '',
    };
  },

  mounted() {
    const text = `嗨，我叫建平，中级前端工程师，喜欢踢球，人称“(进攻终结者)拼命三郎防守哥”，我的位置是边后卫。`
    const paidInternetTroll = new Typer(text, {}, (text) => {
      this.introduction = text;
    });
  },
}
</script>