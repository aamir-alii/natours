const { APIFeatures, AppError, catchAsync } = require('../utils/');

const getAll = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    // to Allow getting reviews on specific tour
    const filterObj = {};
    if (req.params.tourId) filterObj.tour = req.params.tourId;
    let features = new APIFeatures(Model.find(filterObj), req.query);
    features.filter().sort().paginate().limitFields();
    const result = await features.query;
    const data = {};
    data[`${type}s`] = result;
    res.status(200).json({
      status: 'success',
      result: result?.length,
      data,
    });
  });
};

const getOne = (Model, type, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const result = await query;
    if (!result)
      return next(new AppError(`${type} not found with ${req.params.id}`, 404));
    const data = {};
    data[type] = result;
    res.status(200).json({
      status: 'success',
      message: `${type} Detail`,
      data,
    });
  });
};

const create = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const result = await Model.create(req.body);
    const data = {};
    data[type] = result;
    res.status(200).json({
      status: 'success',
      message: `${type} created successfully`,
      data,
    });
  });
};
const update = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!result)
      return next(new AppError(`${type} not found with ${req.params.id}`, 404));
    const data = {};
    data[type] = result;
    res.status(200).json({
      status: 'success',
      message: `${type} updated successfully`,
      data,
    });
  });
};
const deleteRecord = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const result = await Model.findByIdAndDelete(req.params.id);
    if (!result)
      return next(new AppError(`${type} not found with ${req.params.id}`, 404));
    res.status(204).json({ status: 'success' });
  });
};
module.exports = {
  getOne,
  getAll,
  create,
  update,
  deleteRecord,
};
