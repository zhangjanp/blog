module.exports = {
  base: '/blog/',
  title: "Janp",
  description: "Web development, Frontend, JavaScript",
  theme: "@vuepress/blog",
  themeConfig: {
    dateFormat: 'YYYY-MM-DD',
    directories: [
      {
        // Unique ID of current classification
        id: 'post',
        // Target directory
        title: 'post',
        dirname: '_posts',
        path: "/"
        // Path of the `entry page` (or `list page`)
      },
    ],
    nav: [
      {
        text: "About",
        link: "/me.html"
      },
      {
        text: "Github",
        link: "https://github.com/zhangjanp/blog"
      }
    ],
    globalPagination: {
      prevText:'上一页',
      nextText:'下一页',
      lengthPerPage:'5',
      layout:'Pagination',
    },
    footer: {
      contact: [
        {
          type: "github",
          link: "https://github.com/zhangjanp"
        },
        {
          type: "mail",
          link: "mailto:zhang_janp@163.com"
        }
      ],
      copyright: [
        {
          text: "Janp © 2023",
          link: "./"
        }
      ]
    },
    smoothScroll: true,
    lastUpdated: 'Last Updated', // string | boolean
  },
  head:[['script', {}, `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?c54dadf87918d953e0c4aa0210131ab2";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
     `
]],
}