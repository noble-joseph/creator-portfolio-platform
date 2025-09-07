export const getAllCreators = (req, res) => {
  res.send("All creators endpoint");
};

export const getCreatorProfile = (req, res) => {
  res.send(`Profile for creator ${req.params.id}`);
};
