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
        link: "/me/"
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
          text: "Janp © 2020",
          link: "./"
        }
      ]
    },
    smoothScroll: true,
    lastUpdated: 'Last Updated', // string | boolean
  }
}