package com.finance.platform.exceptions.model;

public record ErrorBody(Integer status, String title, String detail) {

}
