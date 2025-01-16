<!--  -->
<template>
  <div class="mail-template-box">
    <h1>我是信件模板</h1>
    <div id="bar">
      <h1>Vue Email Editor (Demo)</h1>

      <button v-on:click="saveDesign">Save Design</button>
      <button v-on:click="exportHtml">Export HTML</button>
    </div>

    <EmailEditor :tools="tools" locale='zh-TW' class="vue-email-editor" ref="emailEditor" v-on:load="editorLoaded"
      :options="emailOptions" />


  </div>

</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { EmailEditor, } from 'vue-email-editor'

const oldObject = {
  "counters": {
    "u_column": 1,
    "u_row": 1,
    "u_content_image": 2,
    "u_content_text": 1
  },
  "body": {
    "id": "BndS3hw7wn",
    "rows": [
      {
        "id": "0JA1oFSF8G",
        "cells": [
          1
        ],
        "columns": [
          {
            "id": "FbEW-MbGys",
            "contents": [
              {
                "id": "MA-cYkie7b",
                "type": "text",
                "values": {
                  "containerPadding": "10px",
                  "anchor": "",
                  "fontSize": "14px",
                  "textAlign": "left",
                  "lineHeight": "140%",
                  "linkStyle": {
                    "body": false,
                    "inherit": true,
                    "linkColor": "#0000ee",
                    "linkUnderline": true,
                    "linkHoverColor": "#0000ee",
                    "linkHoverUnderline": true
                  },
                  "displayCondition": null,
                  "_styleGuide": null,
                  "_meta": {
                    "htmlID": "u_content_text_1",
                    "htmlClassNames": "u_content_text"
                  },
                  "selectable": true,
                  "draggable": true,
                  "duplicatable": true,
                  "deletable": true,
                  "hideable": true,
                  "text": "<p style=\"line-height: 140%;\">This is a new Text block. Change the text<br /><br /><br />.<br /><br />have a nice day<br /><br /><br /><br /><br /><br />best<br /><br /><br /><br /></p>",
                  "_languages": {}
                }
              }
            ],
            "values": {
              "backgroundColor": "transparent",
              "padding": "0px",
              "border": {
                "borderTopWidth": "0px",
                "borderTopStyle": "solid",
                "borderLeftWidth": "0px",
                "borderLeftStyle": "solid",
                "borderRightWidth": "0px",
                "borderRightStyle": "solid",
                "borderBottomWidth": "0px",
                "borderBottomStyle": "solid"
              },
              "borderRadius": "0px",
              "_meta": {
                "htmlID": "u_column_1",
                "htmlClassNames": "u_column"
              }
            }
          }
        ],
        "values": {
          "displayCondition": null,
          "columns": false,
          "_styleGuide": null,
          "backgroundColor": "",
          "columnsBackgroundColor": "",
          "backgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": "no-repeat",
            "size": "custom",
            "position": "center",
            "customPosition": [
              "50%",
              "50%"
            ]
          },
          "padding": "0px",
          "anchor": "",
          "hideDesktop": false,
          "_meta": {
            "htmlID": "u_row_1",
            "htmlClassNames": "u_row"
          },
          "selectable": true,
          "draggable": true,
          "duplicatable": true,
          "deletable": true,
          "hideable": true
        }
      }
    ],
    "headers": [],
    "footers": [],
    "values": {
      "_styleGuide": null,
      "popupPosition": "center",
      "popupWidth": "600px",
      "popupHeight": "auto",
      "borderRadius": "10px",
      "contentAlign": "center",
      "contentVerticalAlign": "center",
      "contentWidth": "500px",
      "fontFamily": {
        "label": "Arial",
        "value": "arial,helvetica,sans-serif"
      },
      "textColor": "#000000",
      "popupBackgroundColor": "#FFFFFF",
      "popupBackgroundImage": {
        "url": "",
        "fullWidth": true,
        "repeat": "no-repeat",
        "size": "cover",
        "position": "center"
      },
      "popupOverlay_backgroundColor": "rgba(0, 0, 0, 0.1)",
      "popupCloseButton_position": "top-right",
      "popupCloseButton_backgroundColor": "#DDDDDD",
      "popupCloseButton_iconColor": "#000000",
      "popupCloseButton_borderRadius": "0px",
      "popupCloseButton_margin": "0px",
      "popupCloseButton_action": {
        "name": "close_popup",
        "attrs": {
          "onClick": "document.querySelector('.u-popup-container').style.display = 'none';"
        }
      },
      "language": {},
      "backgroundColor": "transparent",
      "preheaderText": "",
      "linkStyle": {
        "body": true,
        "linkColor": "#0000ee",
        "linkHoverColor": "#0000ee",
        "linkUnderline": true,
        "linkHoverUnderline": true
      },
      "backgroundImage": {
        "url": "",
        "fullWidth": true,
        "repeat": "no-repeat",
        "size": "custom",
        "position": "center"
      },
      "_meta": {
        "htmlID": "u_body",
        "htmlClassNames": "u_body"
      }
    }
  },
  "schemaVersion": 17
}

/**------------------ */

const emailEditor = ref()

const emailOptions = {
  locale: 'zh-TW',
}


const tools = {
  form: {
    enabled: false
  }
}

const editorLoaded = () => {
  console.log("這是emailEditor", emailEditor.value)

  emailEditor.value.editor.loadDesign(oldObject)

  emailEditor.value.editor.setBodyValues({
    // 背景色改為透明
    backgroundColor: "TRANSPARENT",
    //容器寬度改為100%
    contentWidth: "100%"
  })


  // emailEditor.value.editor.registerCallback('image', function (file: any, done: any) {
  //   console.log('file為', file)
  //   console.log('done', done)
  //   done({ progress: 100, url: "https://png.pngtree.com/png-clipart/20230108/original/pngtree-super-cute-cartoon-vector-bear-png-image_8887896.png" })
  //   // Handle file upload here
  // })




  // Pass your template JSON here
  // this.$refs.emailEditor.editor.loadDesign({});

}

const saveDesign = () => {
  emailEditor.value.editor.saveDesign(
    (design: any) => {
      console.log('saveDesign', design);
    }
  )
}

const exportHtml = () => {
  emailEditor.value.editor.exportHtml(
    (data: any) => {
      console.log('exportHtml', data);
    }, {
    //壓縮html大小
    minify: true
  })
}



</script>

<style scoped lang="scss">
.mail-template-box {
  width: 90%;
  margin: 0 auto;


  .vue-email-editor {
    // min-height: 500px;
    height: 800px;
    margin: 3% auto;
  }

}
</style>
