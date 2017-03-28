const Group = require('../models/group');
const User = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    .populate('users')
    .exec()
    .then((groups) => res.json(groups))
    .catch(next);
}

function createGroup(req, res, next) {
  // console.log(req.body);
  Group
    .create(req.body)
    .then((group) => res.status(201).json(group))
    .catch(next);
}

function showGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users properties.notes.createdBy')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();
      res.json(group);
    })
    .catch(next);
}

function updateGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      for(const field in req.body) {
        group[field] = req.body[field];
      }

      return group.save();
    })
    .then((group) => res.json(group))
    .catch(next);
}

function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      return group.remove();
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyRoute(req, res, next) {
  Group
    .findOne({ users: req.user.id })
    .exec()
    .then((group) => {
      if(!group) return res.notFound();
      const property = group.properties.create(req.body);
      group.properties.push(property);
      return group.save()
        .then(() => res.json(property));
    })
    .catch(next);
}

function deletePropertyRoute(req, res, next) {
  Group
    .findOne({ users: req.user.id})
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listing_id;
      });

      prop.remove();

      return group.save();
    })
    .then(() => res.status(204).end())
    .catch(next);

}

function addPropertyNote(req, res, next) {
  req.body.createdBy = req.user;
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listing_id;
      });

      const note = prop.notes.create(req.body);

      prop.notes.push(note);

      return group.save()
        .then(() => res.json(note));
    })
    .catch(next);
}

module.exports = {
  index: indexGroup,
  create: createGroup,
  show: showGroup,
  update: updateGroup,
  delete: deleteGroup,
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addNote: addPropertyNote
};
