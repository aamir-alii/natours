class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\bgt|gte|lte|lt\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // sorting result
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      return this;
    }
    this.query = this.query.sort('-createdAt');
    return this;
  }
  paginate() {
    // Pagination
    let page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 10;
    let skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  limitFields() {
    // select specific fields
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      return this;
    }
    this.query = this.query.select('-__v');
    return this;
  }
}

module.exports = APIFeatures;
