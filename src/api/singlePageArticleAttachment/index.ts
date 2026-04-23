import request from "@/utils/request";
import { AxiosPromise } from "axios";



/**
 * 獲取該單頁文章全部附件
 * @returns 
 */
export function getAllSinglePageArticleAttachmentApi(singlePageArticleId: number): AxiosPromise {
  return request({
    url: `single-page-article-attachment/${singlePageArticleId}`,
    method: "get",
  });
}


/**
 * 新增單頁文章附件
 * @param data 
 * @returns 
 */
export function addSinglePageArticleAttachmentApi(data: any): AxiosPromise {
  return request({
    url: "single-page-article-attachment",
    method: "post",
    data,
    // headers: {
    //   "Content-Type": "multipart/form-data"
    // }
  });
}

/**
 * 刪除該單頁文章單一附件
 * @param id 
 * @returns 
 */
export function deleteSinglePageArticleAttachmentApi(id: number): AxiosPromise {
  return request({
    url: `single-page-article-attachment/${id}`,
    method: "delete",
  });
}



